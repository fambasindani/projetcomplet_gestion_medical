package adc.gestion_hospitaliere.dto.examen;

import adc.gestion_hospitaliere.Enums.ConfidentialiteExamen;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ExamenRequestDto {
    // Ces champs ne sont obligatoires qu'à la CRÉATION.
    // En mise à jour (PUT), l'update est partiel : le formulaire de résultat
    // n'envoie que les champs de résultat, sans patient/médecin/catégorie.
    public interface Creation {}

    private Integer idPrescription;
    @NotNull(groups = Creation.class) private Integer idPatient;
    @NotNull(groups = Creation.class) private Integer idMedecinPrescripteur;
    private String typeExamen;
    @NotNull(groups = Creation.class) private Integer idCategorieExamen;   // ← clé étrangère vers CategorieExamen
    private Integer idActeCatalogue;              // ← acte précis du référentiel (actes_catalogue)
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