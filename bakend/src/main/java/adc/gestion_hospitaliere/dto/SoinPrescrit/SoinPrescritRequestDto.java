package adc.gestion_hospitaliere.dto.SoinPrescrit;
import adc.gestion_hospitaliere.Enums.StatutSoin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SoinPrescritRequestDto {
    @NotNull
    private Integer idPrescription;
    @NotNull
    private Integer idPatient;
    private Integer idInfirmier;
    @NotBlank
    private String description;
    private String instructions;
    private String frequence;
    private String duree;
    private StatutSoin statut;
}
