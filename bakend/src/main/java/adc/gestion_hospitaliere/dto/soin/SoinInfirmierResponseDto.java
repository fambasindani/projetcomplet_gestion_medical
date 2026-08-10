package adc.gestion_hospitaliere.dto.soin;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SoinInfirmierResponseDto {
    private Integer idSoin;
    private Integer idHospitalisation;
    private String patientNom;
    private Integer idInfirmier;
    private String infirmierNom;
    private LocalDateTime dateSoin;
    private String typeSoin;
    private String description;
    private String observations;
    private Boolean signatureInfirmier;
}
