package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Notification;
import adc.gestion_hospitaliere.Entity.RendezVous;
import adc.gestion_hospitaliere.Enums.TypeNotification;
import adc.gestion_hospitaliere.Repository.NotificationRepository;
import adc.gestion_hospitaliere.Repository.RendezVousRepository;
import adc.gestion_hospitaliere.dto.notification.NotificationRequestDto;
import adc.gestion_hospitaliere.dto.notification.NotificationResponseDto;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final RendezVousRepository rendezVousRepository;

    // ---------- LECTURE ----------

    public Page<NotificationResponseDto> getAll(Boolean lue, Pageable pageable) {
        Page<Notification> page = (lue != null)
                ? notificationRepository.findByLue(lue, pageable)
                : notificationRepository.findAllByOrderByDateCreationDesc(pageable);
        return page.map(this::toDto);
    }

    public Page<NotificationResponseDto> getNonLues(Pageable pageable) {
        return notificationRepository.findByLue(false, pageable).map(this::toDto);
    }

    public long countNonLues() {
        return notificationRepository.countByLue(false);
    }

    public NotificationResponseDto getById(Integer id) {
        return toDto(notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée")));
    }

    // ---------- CRÉATION ----------

    @Transactional
    public NotificationResponseDto create(NotificationRequestDto dto) {
        Notification notification = Notification.builder()
                .typeNotification(dto.getTypeNotification())
                .titre(dto.getTitre())
                .message(dto.getMessage())
                .referenceType(dto.getReferenceType())
                .referenceId(dto.getReferenceId())
                .lue(dto.getLue() != null && dto.getLue())
                .build();
        return toDto(notificationRepository.save(notification));
    }

    // ---------- GESTION DE LA LECTURE ----------

    @Transactional
    public NotificationResponseDto marquerLue(Integer id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification non trouvée"));
        notification.setLue(true);
        return toDto(notificationRepository.save(notification));
    }

    @Transactional
    public long marquerToutesLues() {
        int updated = notificationRepository.findAll().stream()
                .filter(n -> !Boolean.TRUE.equals(n.getLue()))
                .map(n -> { n.setLue(true); return n; })
                .map(notificationRepository::save)
                .toList()
                .size();
        return updated;
    }

    // ---------- SUPPRESSION ----------

    @Transactional
    public void delete(Integer id) {
        notificationRepository.deleteById(id);
    }

    // ---------- CRÉATION PROGRAMMÉE (déclencheurs métier) ----------

    @Transactional
    public NotificationResponseDto notifier(TypeNotification type, String titre, String message,
                                            String referenceType, Integer referenceId) {
        Notification notification = Notification.builder()
                .typeNotification(type)
                .titre(titre)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .lue(false)
                .build();
        return toDto(notificationRepository.save(notification));
    }

    // Tous les matins à 07h00 : rappel des rendez-vous du jour
    @Scheduled(cron = "0 0 7 * * *")
    @Transactional
    public void genererRappelRdvDuJour() {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(LocalTime.MAX);
        List<RendezVous> rdvs = rendezVousRepository.findByDateRdvBetween(start, end);
        for (RendezVous rdv : rdvs) {
            String patientNom = rdv.getPatient() != null
                    ? rdv.getPatient().getNom() + " " + rdv.getPatient().getPrenom()
                    : "Patient";
            notifier(
                    TypeNotification.RDV_AUJOURDHUI,
                    "Rendez-vous aujourd'hui",
                    "Rendez-vous de " + patientNom + " prévu aujourd'hui à " +
                            (rdv.getDateRdv() != null ? rdv.getDateRdv().toLocalTime() : LocalTime.now()) + ".",
                    "RDV", rdv.getIdRdv());
        }
    }

    // ---------- CONVERSION ----------

    private NotificationResponseDto toDto(Notification notification) {
        return NotificationResponseDto.builder()
                .idNotification(notification.getIdNotification())
                .typeNotification(notification.getTypeNotification())
                .titre(notification.getTitre())
                .message(notification.getMessage())
                .referenceType(notification.getReferenceType())
                .referenceId(notification.getReferenceId())
                .lue(notification.getLue())
                .dateCreation(notification.getDateCreation())
                .build();
    }
}
