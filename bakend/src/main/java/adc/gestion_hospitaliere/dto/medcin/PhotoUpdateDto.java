package adc.gestion_hospitaliere.dto.medcin;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PhotoUpdateDto {
    @NotBlank
    private String photo;
}