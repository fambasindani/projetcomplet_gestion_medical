package adc.gestion_hospitaliere.dto.facture;

import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActeMedicalRequestDto {

    @NotBlank(message = "Le code acte est requis")
    private String codeActe;

    @NotBlank(message = "Le libellé est requis")
    private String libelle;

    private String description;

    @NotNull(message = "Le prix de base est requis")
    private Double prixBase;

    @NotNull(message = "La catégorie est requise")
    private CategorieActeMedical categorie;

    private Double coefficient;
    private String lettreCle;
    private Boolean remboursable;
    private Integer tauxRemboursement;
    private Boolean actif;
}
