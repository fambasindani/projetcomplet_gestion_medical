package adc.gestion_hospitaliere.dto.SoinPrescrit;
import adc.gestion_hospitaliere.Enums.StatutSoin;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class SoinPrescritResponseDto {
    private Integer idSoin;
    private Integer idPrescription;
    private Integer idPatient;
    private String patientNom;
    private Integer idInfirmier;
    private String infirmierNom;
    private String description;
    private String instructions;
    private String frequence;
    private String duree;
    private StatutSoin statut;
    private LocalDateTime datePrescription;
}
