package adc.gestion_hospitaliere.dto.catalogue;

import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GroupeActeRequestDto {

    @NotBlank(message = "Le libellé est requis")
    private String libelle;

    @NotNull(message = "La catégorie est requise")
    private CategorieActeMedical categorie;

    private String description;

    private Boolean actif;
}
