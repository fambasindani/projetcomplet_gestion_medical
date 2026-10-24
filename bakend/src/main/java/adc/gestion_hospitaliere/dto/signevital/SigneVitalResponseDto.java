package adc.gestion_hospitaliere.dto.signevital;
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
public class SigneVitalResponseDto {
    private Integer idSigneVital;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idPersonnel;
    private String prisePar;
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
    private String observations;
}
