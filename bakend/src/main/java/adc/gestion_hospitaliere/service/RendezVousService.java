package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;

import adc.gestion_hospitaliere.Entity.*;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.rendezvous.RendezVousRequestDto;
import adc.gestion_hospitaliere.dto.rendezvous.RendezVousResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RendezVousService {
    private final RendezVousRepository rendezVousRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    public List<RendezVousResponseDto> getPlanningJournalier(LocalDateTime date, Integer idMedecin) {
        LocalDateTime start = date.withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime end = date.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        List<RendezVous> rdvs;
        if (idMedecin != null) {
            rdvs = rendezVousRepository.findByIdMedecinAndDateRdvBetween(idMedecin, start, end);
        } else {
            rdvs = rendezVousRepository.findByDateRdvBetween(start, end);
        }
        return rdvs.stream().map(this::toResponseDto).collect(Collectors.toList());
    }

    public long compterAujourdhui(Integer idMedecin) {
        LocalDateTime start = LocalDate.now().atStartOfDay();
        LocalDateTime end = LocalDate.now().atTime(23, 59, 59);
        if (idMedecin != null) {
            return rendezVousRepository.countByIdMedecinAndDateRdvBetween(idMedecin, start, end);
        }
        return rendezVousRepository.countByDateRdvBetween(start, end);
    }

    @Transactional
    public void changerStatut(Integer id, StatutRendezVous statut) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez‑vous non trouvé"));
        rdv.setStatut(statut);
        rendezVousRepository.save(rdv);
    }

    public Page<RendezVousResponseDto> search(StatutRendezVous statut, LocalDateTime start, LocalDateTime end,
                                              Integer idMedecin, Integer idPatient, Pageable pageable) {
        return rendezVousRepository.search(statut, start, end, idMedecin, idPatient, pageable)
                .map(this::toResponseDto);
    }

    public Page<RendezVousResponseDto> getAll(Pageable pageable) {
        return rendezVousRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<RendezVousResponseDto> getByPatient(Integer patientId, Pageable pageable) {
        return rendezVousRepository.findByIdPatient(patientId, pageable).map(this::toResponseDto);
    }

    public Page<RendezVousResponseDto> getByMedecin(Integer medecinId, Pageable pageable) {
        return rendezVousRepository.findByIdMedecin(medecinId, pageable).map(this::toResponseDto);
    }

    public Page<RendezVousResponseDto> getByStatut(StatutRendezVous statut, Pageable pageable) {
        return rendezVousRepository.findByStatut(statut, pageable).map(this::toResponseDto);
    }

    public RendezVousResponseDto getById(Integer id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));
        return toResponseDto(rdv);
    }

    @Transactional
    public RendezVousResponseDto create(RendezVousRequestDto dto) {
        // Vérifier conflit de planning (optionnel)
        // ...
        RendezVous rdv = new RendezVous();
        rdv.setIdPatient(dto.getIdPatient());
        rdv.setIdMedecin(dto.getIdMedecin());
        rdv.setDateRdv(dto.getDateRdv());
        rdv.setMotif(dto.getMotif());
        rdv.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutRendezVous.Programmé);
        rdv.setTypeConsultation(dto.getTypeConsultation());
        rdv.setDureeEstimee(dto.getDureeEstimee());
        rdv.setNotesPreliminaires(dto.getNotesPreliminaires());
        rdv.setRappelEnvoye(dto.getRappelEnvoye() != null ? dto.getRappelEnvoye() : false);
        rdv = rendezVousRepository.save(rdv);
        return toResponseDto(rdv);
    }

    @Transactional
    public RendezVousResponseDto update(Integer id, RendezVousRequestDto dto) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));
        rdv.setIdPatient(dto.getIdPatient());
        rdv.setIdMedecin(dto.getIdMedecin());
        rdv.setDateRdv(dto.getDateRdv());
        rdv.setMotif(dto.getMotif());
        if (dto.getStatut() != null) rdv.setStatut(dto.getStatut());
        rdv.setTypeConsultation(dto.getTypeConsultation());
        rdv.setDureeEstimee(dto.getDureeEstimee());
        rdv.setNotesPreliminaires(dto.getNotesPreliminaires());
        rdv.setRappelEnvoye(dto.getRappelEnvoye());
        rdv = rendezVousRepository.save(rdv);
        return toResponseDto(rdv);
    }

    @Transactional
    public void annuler(Integer id, String motifAnnulation) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));
        rdv.setStatut(StatutRendezVous.Annulé);
        rdv.setMotifAnnulation(motifAnnulation);
        rdv.setDateAnnulation(LocalDateTime.now());
        rendezVousRepository.save(rdv);
    }

    @Transactional
    public void delete(Integer id) {
        rendezVousRepository.deleteById(id);
    }

    private RendezVousResponseDto toResponseDto(RendezVous rdv) {
        String patientNom = rdv.getPatient() != null ? rdv.getPatient().getNom() : null;
        String patientPrenom = rdv.getPatient() != null ? rdv.getPatient().getPrenom() : null;
        String medecinNom = rdv.getMedecin() != null ? rdv.getMedecin().getNom() : null;
        String medecinPrenom = rdv.getMedecin() != null ? rdv.getMedecin().getPrenom() : null;
        String specialite = rdv.getMedecin() != null && rdv.getMedecin().getSpecialite() != null ?
                rdv.getMedecin().getSpecialite().getNomSpecialite() : null;
        return RendezVousResponseDto.builder()
                .idRdv(rdv.getIdRdv())
                .idPatient(rdv.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .idMedecin(rdv.getIdMedecin())
                .medecinNom(medecinNom)
                .medecinPrenom(medecinPrenom)
                .medecinSpecialite(specialite)
                .dateRdv(rdv.getDateRdv())
                .motif(rdv.getMotif())
                .statut(rdv.getStatut())
                .typeConsultation(rdv.getTypeConsultation())
                .dureeEstimee(rdv.getDureeEstimee())
                .notesPreliminaires(rdv.getNotesPreliminaires())
                .dateAnnulation(rdv.getDateAnnulation())
                .motifAnnulation(rdv.getMotifAnnulation())
                .rappelEnvoye(rdv.getRappelEnvoye())
                .build();
    }
}
