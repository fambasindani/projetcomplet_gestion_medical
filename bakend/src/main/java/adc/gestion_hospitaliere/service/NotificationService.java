package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Notification;
import adc.gestion_hospitaliere.Entity.RendezVous;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Enums.TypeNotification;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.NotificationRepository;
import adc.gestion_hospitaliere.Repository.RendezVousRepository;
import adc.gestion_hospitaliere.Repository.UserRepository;
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
    private final MedecinRepository medecinRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    /** Utilisateur (compte) associé à un médecin, ou null. */
    private Long userIdPourMedecin(Integer idMedecin) {
        if (idMedecin == null) return null;
        return medecinRepository.findById(idMedecin)
                .map(Medecin::getEmail)
                .flatMap(userRepository::findByEmail)
                .map(User::getId)
                .orElse(null);
    }

    // ---------- CONtexte UTILISATEUR ----------

    private Role roleCourant() {
        return currentUserService.roleCourant();
    }

    private Long userIdCourant() {
        User u = currentUserService.utilisateurCourant();
        return u != null ? u.getId() : null;
    }

    private boolean estAdmin() {
        return roleCourant() == Role.ADMIN;
    }

    // ---------- LECTURE ----------

    public Page<NotificationResponseDto> getAll(Boolean lue, Pageable pageable) {
        if (estAdmin()) {
            Page<Notification> page = (lue != null)
                    ? notificationRepository.findByLue(lue, pageable)
                    : notificationRepository.findAllByOrderByDateCreationDesc(pageable);
            return page.map(this::toDto);
        }
        Role role = roleCourant();
        Long userId = userIdCourant();
        if (Boolean.FALSE.equals(lue)) {
            return notificationRepository.findNonLuesPourUtilisateur(role, userId, pageable).map(this::toDto);
        }
        return notificationRepository.findPourUtilisateur(role, userId, pageable).map(this::toDto);
    }

    public Page<NotificationResponseDto> getNonLues(Pageable pageable) {
        if (estAdmin()) {
            return notificationRepository.findByLue(false, pageable).map(this::toDto);
        }
        return notificationRepository.findNonLuesPourUtilisateur(roleCourant(), userIdCourant(), pageable).map(this::toDto);
    }

    public long countNonLues() {
        if (estAdmin()) {
            return notificationRepository.countByLue(false);
        }
        return notificationRepository.countNonLuesPourUtilisateur(roleCourant(), userIdCourant());
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
        List<Notification> aMarquer = estAdmin()
                ? notificationRepository.findAll().stream().filter(n -> !Boolean.TRUE.equals(n.getLue())).toList()
                : notificationRepository.findNonLuesListePourUtilisateur(roleCourant(), userIdCourant());
        aMarquer.forEach(n -> n.setLue(true));
        notificationRepository.saveAll(aMarquer);
        return aMarquer.size();
    }

    // ---------- SUPPRESSION ----------

    @Transactional
    public void delete(Integer id) {
        notificationRepository.deleteById(id);
    }

    // ---------- CRÉATION PROGRAMMÉE (déclencheurs métier) ----------

    /** Diffusion générale (visible par tous). */
    @Transactional
    public NotificationResponseDto notifier(TypeNotification type, String titre, String message,
                                            String referenceType, Integer referenceId) {
        return notifier(type, titre, message, referenceType, referenceId, null, null);
    }

    /** Notification ciblée sur un rôle et/ou un utilisateur précis. */
    @Transactional
    public NotificationResponseDto notifier(TypeNotification type, String titre, String message,
                                            String referenceType, Integer referenceId,
                                            Role roleDestinataire, Long idDestinataire) {
        Notification notification = Notification.builder()
                .typeNotification(type)
                .titre(titre)
                .message(message)
                .referenceType(referenceType)
                .referenceId(referenceId)
                .roleDestinataire(roleDestinataire)
                .idDestinataire(idDestinataire)
                .lue(false)
                .build();
        return toDto(notificationRepository.save(notification));
    }

    // Tous les matins à 07h00 : rappel des rendez-vous du jour (ciblé médecins)
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
            Long destinataire = userIdPourMedecin(rdv.getIdMedecin());
            notifier(
                    TypeNotification.RDV_AUJOURDHUI,
                    "Rendez-vous aujourd'hui",
                    "Rendez-vous de " + patientNom + " prévu aujourd'hui à " +
                            (rdv.getDateRdv() != null ? rdv.getDateRdv().toLocalTime() : LocalTime.now()) + ".",
                    "RDV", rdv.getIdRdv(),
                    destinataire != null ? null : Role.MEDECIN, destinataire);
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
