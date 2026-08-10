package adc.gestion_hospitaliere.dto.soinInfirmier;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SoinInfirmierRequestDto {
    @NotNull
    private Integer idHospitalisation;
    @NotNull
    private Integer idInfirmier;
    @NotNull
    private LocalDateTime dateSoin;
    @NotBlank
    private String typeSoin;
    private String description;
    private String observations;
    private Boolean signatureInfirmier;
}
