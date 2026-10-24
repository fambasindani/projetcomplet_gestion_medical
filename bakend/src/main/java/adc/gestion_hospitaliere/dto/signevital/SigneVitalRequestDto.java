package adc.gestion_hospitaliere.dto.signevital;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SigneVitalRequestDto {
    @NotNull
    private Integer idPatient;
    private Integer idPersonnel;
    @NotNull
    private LocalDateTime dateMesure;
    private BigDecimal poids;
    private BigDecimal taille;
    private BigDecimal imc;
    private BigDecimal temperature;
    private Integer pouls;
    private Integer pressionSystolique;
    private Integer pressionDiastolique;
    private Integer saturation;
    private Integer frequenceRespiratoire;
    private BigDecimal glycemie;
    private Integer douleurEchelle;
    private String prisePar;
    private String observations;
}
