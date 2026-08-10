package adc.gestion_hospitaliere.dto.patient;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PatientUpdateDto extends PatientRequestDto {
    @NotNull private Integer idPatient;
}