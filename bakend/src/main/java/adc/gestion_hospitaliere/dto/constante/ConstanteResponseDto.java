package adc.gestion_hospitaliere.dto.constante;
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
public class ConstanteResponseDto {
    private Integer idConstante;
    private Integer idHospitalisation;
    private String hospitalisationNumero; // numéro d'admission
    private LocalDateTime dateMesure;
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
