package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;

import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.dosiier_medical.DossierMedicalDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

// service/DossierMedicalService.java
@Service
@RequiredArgsConstructor

public class DossierMedicalService {

    private final PatientRepository patientRepository;
    private final ConsultationRepository consultationRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ExamenRepository examenRepository;
    private final HospitalisationRepository hospitalisationRepository;
    private final InterventionRepository interventionRepository;

    public DossierMedicalDTO getDossierMedical(Integer patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));

        // Consultations
        List<DossierMedicalDTO.ConsultationResume> consultations = consultationRepository.findByPatient_IdPatient(patientId).stream()
                .map(c -> DossierMedicalDTO.ConsultationResume.builder()
                        .idConsultation(c.getIdConsultation())
                        .dateConsultation(c.getDateConsultation())
                        .motif(c.getMotifConsultation())
                        .diagnostic(c.getDiagnostic())
                        .medecinNom(c.getMedecin().getNom())
                        .medecinPrenom(c.getMedecin().getPrenom())
                        .build())
                .collect(Collectors.toList());

        // Prescriptions (jointure avec patient)
        List<DossierMedicalDTO.PrescriptionResume> prescriptions = prescriptionRepository.findByPatientId(patientId).stream()
                .map(p -> DossierMedicalDTO.PrescriptionResume.builder()
                        .idPrescription(p.getIdPrescription())
                        .datePrescription(p.getDatePrescription())
                        .type(p.getTypePrescription().name()) // ou p.getTypePrescription().toString()
                        .description(p.getDescription())
                        .instructions(p.getInstructions())
                        .statut(p.getStatut().name())
                        .build())
                .collect(Collectors.toList());

        // Examens
        List<DossierMedicalDTO.ExamenResume> examens = examenRepository.findByPatientId(patientId).stream()
                .map(e -> DossierMedicalDTO.ExamenResume.builder()
                        .idExamen(e.getIdExamen())
                        .typeExamen(e.getTypeExamen())
                        .dateRealisation(e.getDateRealisation())
                        .resultat(e.getResultat())
                        .conclusion(e.getConclusion())
                        .statut(e.getStatut().name())
                        .build())
                .collect(Collectors.toList());

        // Hospitalisations
        // Hospitalisations
        List<DossierMedicalDTO.HospitalisationResume> hospitalisations = hospitalisationRepository.findByPatientId(patientId).stream()
                .map(h -> DossierMedicalDTO.HospitalisationResume.builder()
                        .idHospitalisation(h.getIdHospitalisation())
                        .numeroAdmission(h.getNumeroAdmission())
                        .dateAdmission(h.getDateAdmission())
                        .dateSortie(h.getDateSortie())
                        .motifAdmission(h.getMotifAdmission())
                        .diagnosticPrincipal(h.getDiagnosticPrincipal())
                        .statut(h.getStatut() != null ? h.getStatut().name() : null)
                        .modeSortie(h.getModeSortie() != null ? h.getModeSortie().name() : null)
                        .build())
                .collect(Collectors.toList());

        // Interventions
        List<DossierMedicalDTO.InterventionResume> interventions = interventionRepository.findByPatientId(patientId).stream()
                .map(i -> DossierMedicalDTO.InterventionResume.builder()
                        .idIntervention(i.getIdIntervention())
                        .typeIntervention(i.getTypeIntervention())
                        .dateIntervention(i.getDateIntervention())
                        .chirurgienPrincipal(i.getMedecinPrincipal().getNom() + " " + i.getMedecinPrincipal().getPrenom())
                        .anesthesieType(i.getAnesthesieType())
                        .resultat(i.getResultat())
                        .build())
                .collect(Collectors.toList());

        return DossierMedicalDTO.builder()
                .idPatient(patient.getIdPatient())
                .nom(patient.getNom())
                .prenom(patient.getPrenom())
                .dateNaissance(patient.getDateNaissance().toLocalDate())
                .genre(patient.getGenre().name())
                .groupeSanguin(patient.getGroupeSanguin().name())
                .allergies(patient.getAllergies())
                .antecedentsMedicaux(patient.getAntecedentsMedicaux())
                .antecedentsChirurgicaux(patient.getAntecedentsChirurgicaux())
                .traitementHabituel(patient.getTraitementHabituel())
                .mutuelle(patient.getMutuelle())
                .consultations(consultations)
                .prescriptions(prescriptions)
                .examens(examens)
                .hospitalisations(hospitalisations)
                .interventions(interventions)
                .build();
    }
}