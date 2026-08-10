package adc.gestion_hospitaliere.dto.examen;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class ExamensBatchRequest {
    private Integer idPrescription;
    @Valid @NotNull
    private List<ExamenRequestDto> examens;
}
