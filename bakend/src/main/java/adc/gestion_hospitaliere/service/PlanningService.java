package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;

import adc.gestion_hospitaliere.Entity.RendezVous;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import adc.gestion_hospitaliere.Repository.RendezVousRepository;
import adc.gestion_hospitaliere.dto.planning.RendezVousResponseDto;
import adc.gestion_hospitaliere.util.TransitionsStatut;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PlanningService {

    private final RendezVousRepository rendezVousRepository;

    public Page<RendezVousResponseDto> getRendezVousByMedecin(Integer medecinId,
                                                              LocalDateTime start,
                                                              LocalDateTime end,
                                                              StatutRendezVous statut,
                                                              Pageable pageable) {
        Page<RendezVous> page = rendezVousRepository.search(statut, start, end, medecinId, null, pageable);
        return page.map(this::convertToDto);
    }

    @Transactional
    public void updateStatut(Integer rendezVousId, StatutRendezVous nouveauStatut) {
        RendezVous rdv = rendezVousRepository.findById(rendezVousId)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous non trouvé"));
        TransitionsStatut.verifierRendezVous(rdv.getStatut(), nouveauStatut);
        rdv.setStatut(nouveauStatut);
        rendezVousRepository.save(rdv);
    }

    // Méthode ajoutée pour les statistiques
    public long countByMedecinAndDateBetween(Integer medecinId, LocalDateTime start, LocalDateTime end) {
        if (medecinId == null) {
            return rendezVousRepository.countByDateRdvBetween(start, end);
        }
        return rendezVousRepository.countByIdMedecinAndDateRdvBetween(medecinId, start, end);
    }

    private RendezVousResponseDto convertToDto(RendezVous rdv) {
        return RendezVousResponseDto.builder()
                .idRdv(rdv.getIdRdv())
                .dateRdv(rdv.getDateRdv())
                .motif(rdv.getMotif())
                .statut(rdv.getStatut().name())
                .typeConsultation(rdv.getTypeConsultation())
                .dureeEstimee(rdv.getDureeEstimee())
                .idPatient(rdv.getPatient() != null ? rdv.getPatient().getIdPatient() : null)
                .patientNom(rdv.getPatient() != null ? rdv.getPatient().getNom() : null)
                .patientPrenom(rdv.getPatient() != null ? rdv.getPatient().getPrenom() : null)
                .idMedecin(rdv.getMedecin() != null ? rdv.getMedecin().getIdMedecin() : null)
                .medecinNom(rdv.getMedecin() != null ? rdv.getMedecin().getNom() : null)
                .medecinPrenom(rdv.getMedecin() != null ? rdv.getMedecin().getPrenom() : null)
                .idConsultation(rdv.getConsultation() != null ? rdv.getConsultation().getIdConsultation() : null)
                .build();
    }
}