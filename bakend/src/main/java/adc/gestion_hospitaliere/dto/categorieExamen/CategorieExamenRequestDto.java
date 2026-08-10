package adc.gestion_hospitaliere.dto.categorieExamen;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategorieExamenRequestDto {
    @NotBlank
    private String code;
    @NotBlank
    private String libelle;
    private String description;
    private Boolean actif;
}