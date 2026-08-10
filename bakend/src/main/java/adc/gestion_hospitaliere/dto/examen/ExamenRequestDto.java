package adc.gestion_hospitaliere.dto.examen;

import adc.gestion_hospitaliere.Enums.ConfidentialiteExamen;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExamenRequestDto {
    private Integer idPrescription;
    @NotNull private Integer idPatient;
    @NotNull private Integer idMedecinPrescripteur;
    private String typeExamen;
    @NotNull private Integer idCategorieExamen;   // ← clé étrangère vers CategorieExamen
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
    private ConfidentialiteExamen confidentialite;
}