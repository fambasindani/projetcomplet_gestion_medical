package adc.gestion_hospitaliere.dto.laboratoire;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AffectationLaboratoireDto {
    @NotNull private Integer idPersonnel;
    @NotNull private Integer idLaboratoire;
}