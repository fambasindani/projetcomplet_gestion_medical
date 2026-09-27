package adc.gestion_hospitaliere.dto.laboratoire;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LaboratoireRequestDto {
    @NotBlank private String nom;
    private String type;
    private String responsable;
    private String accreditation;
    private Boolean actif;
}