package adc.gestion_hospitaliere.dto.medcin;
import adc.gestion_hospitaliere.Enums.Disponibilite;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DisponibiliteUpdateDto {
    @NotNull
    private Disponibilite disponibilite;
}