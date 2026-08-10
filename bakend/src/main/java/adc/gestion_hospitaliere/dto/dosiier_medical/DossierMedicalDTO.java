package adc.gestion_hospitaliere.dto.dosiier_medical;


import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DossierMedicalDTO {
    // Infos patient
    private Integer idPatient;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String genre;
    private String groupeSanguin;
    private String allergies;
    private String antecedentsMedicaux;
    private String antecedentsChirurgicaux;
    private String traitementHabituel;
    private String mutuelle;

    // Consultations
    private List<ConsultationResume> consultations;

    // Prescriptions (médicaments, examens, soins)
    private List<PrescriptionResume> prescriptions;

    // Examens
    private List<ExamenResume> examens;

    // Hospitalisations
    private List<HospitalisationResume> hospitalisations;

    // Interventions chirurgicales
    private List<InterventionResume> interventions;

    @Data @Builder
    public static class ConsultationResume {
        private Integer idConsultation;
        private LocalDateTime dateConsultation;
        private String motif;
        private String diagnostic;
        private String medecinNom;
        private String medecinPrenom;
    }

    @Data @Builder
    public static class PrescriptionResume {
        private Integer idPrescription;
        private LocalDateTime datePrescription;
        private String type; // Médicament, Examen, Soin
        private String description;
        private String instructions;
        private String statut;
    }

    @Data @Builder
    public static class ExamenResume {
        private Integer idExamen;
        private String typeExamen;
        private LocalDateTime dateRealisation;
        private String resultat;
        private String conclusion;
        private String statut;
    }

    @Data @Builder
    public static class HospitalisationResume {
        private Integer idHospitalisation;
        private String numeroAdmission;
        private LocalDateTime dateAdmission;
        private LocalDateTime dateSortie;
        private String motifAdmission;
        private String diagnosticPrincipal;
        private String statut;
        private String modeSortie;
    }

    @Data @Builder
    public static class InterventionResume {
        private Integer idIntervention;
        private String typeIntervention;
        private LocalDateTime dateIntervention;
        private String chirurgienPrincipal;
        private String anesthesieType;
        private String resultat;
    }
}