package adc.gestion_hospitaliere.dto.examen;

import adc.gestion_hospitaliere.Enums.ConfidentialiteExamen;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ExamenResponseDto {
    private Integer idExamen;
    private String numeroExamen;
    private Integer idPrescription;
    private Integer idPatient;
    private String patientNom;
    private Integer idMedecinPrescripteur;
    private String medecinNom;
    private String typeExamen;
    private Integer idCategorieExamen;
    private String libelleCategorie;
    private LocalDateTime datePrescription;
    private LocalDateTime datePlanification;
    private LocalDateTime dateRealisation;
    private String laboratoire;
    private String technicien;
    private String resultat;
    private String interpretation;
    private String fichierJoint;
    private String compteRendu;
    private String anomalies;
    private String conclusion;
    private StatutExamen statut;
    private LocalDateTime dateValidation;
    private Integer validePar;
    private String validateurNom;
    private ConfidentialiteExamen confidentialite;
}