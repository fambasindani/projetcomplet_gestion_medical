package adc.gestion_hospitaliere.dto.service;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AffectationServiceDto {
    @NotNull private Integer idPersonnel;
    @NotNull private Integer idService;
}