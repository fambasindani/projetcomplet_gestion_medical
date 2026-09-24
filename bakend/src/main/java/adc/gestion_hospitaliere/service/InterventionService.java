package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Intervention;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Repository.HospitalisationRepository;
import adc.gestion_hospitaliere.Repository.InterventionRepository;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.dto.intervention.InterventionResponseDto;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterventionService {

    private final InterventionRepository interventionRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final HospitalisationRepository hospitalisationRepository;
    private final CurrentUserService currentUserService;

    @Transactional(readOnly = true)
    public InterventionResponseDto getById(Integer id) {
        Intervention intervention = interventionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention non trouvée"));
        // Un médecin ne peut consulter que les interventions qui le concernent.
        Integer filtre = currentUserService.filtreMedecinId();
        if (filtre != null && filtre >= 0
                && !filtre.equals(intervention.getIdMedecinPrincipal())
                && !filtre.equals(intervention.getIdAnesthesiste())) {
            throw new ResourceNotFoundException("Intervention non trouvée");
        }
        return toDto(intervention);
    }

    @Transactional(readOnly = true)
    public Page<InterventionResponseDto> getByPatient(Integer patientId, Pageable pageable) {
        List<InterventionResponseDto> all = interventionRepository.findByPatientId(patientId).stream()
                .map(this::toDto).toList();
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), all.size());
        if (start > all.size()) start = all.size();
        return new PageImpl<>(all.subList(start, end), pageable, all.size());
    }

    private InterventionResponseDto toDto(Intervention i) {
        String patientNom = null, patientPrenom = null;
        if (i.getIdPatient() != null) {
            Patient p = patientRepository.findById(i.getIdPatient()).orElse(null);
            if (p != null) { patientNom = p.getNom(); patientPrenom = p.getPrenom(); }
        }
        String medecinNom = null, medecinPrenom = null;
        if (i.getIdMedecinPrincipal() != null) {
            Medecin m = medecinRepository.findById(i.getIdMedecinPrincipal()).orElse(null);
            if (m != null) { medecinNom = m.getNom(); medecinPrenom = m.getPrenom(); }
        }
        String anesthesisteNom = null;
        if (i.getIdAnesthesiste() != null) {
            anesthesisteNom = medecinRepository.findById(i.getIdAnesthesiste()).map(Medecin::getNom).orElse(null);
        }
        String numeroAdmission = null;
        if (i.getIdHospitalisation() != null) {
            numeroAdmission = hospitalisationRepository.findById(i.getIdHospitalisation())
                    .map(h -> h.getNumeroAdmission()).orElse(null);
        }
        return InterventionResponseDto.builder()
                .idIntervention(i.getIdIntervention())
                .numeroIntervention(i.getNumeroIntervention())
                .idHospitalisation(i.getIdHospitalisation())
                .numeroAdmission(numeroAdmission)
                .idPatient(i.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .idMedecinPrincipal(i.getIdMedecinPrincipal())
                .medecinPrincipalNom(medecinNom)
                .medecinPrincipalPrenom(medecinPrenom)
                .typeIntervention(i.getTypeIntervention())
                .descriptionPreop(i.getDescriptionPreop())
                .dateIntervention(i.getDateIntervention())
                .dureePrevue(i.getDureePrevue())
                .dureeReelle(i.getDureeReelle())
                .salleOperation(i.getSalleOperation())
                .anesthesieType(i.getAnesthesieType())
                .idAnesthesiste(i.getIdAnesthesiste())
                .anesthesisteNom(anesthesisteNom)
                .compteRenduOperatoire(i.getCompteRenduOperatoire())
                .complications(i.getComplications())
                .resultat(i.getResultat())
                .suitesOperatoires(i.getSuitesOperatoires())
                .statut(i.getStatut())
                .dateAnnulation(i.getDateAnnulation())
                .motifAnnulation(i.getMotifAnnulation())
                .consentementSigne(i.getConsentementSigne())
                .jeunRespecte(i.getJeunRespecte())
                .notesInfirmieres(i.getNotesInfirmieres())
                .build();
    }
}
