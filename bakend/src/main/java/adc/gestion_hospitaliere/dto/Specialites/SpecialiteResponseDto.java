package adc.gestion_hospitaliere.dto.Specialites;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SpecialiteResponseDto {
    private Integer idSpecialite;
    private String nomSpecialite;
    private String description;
    private String chefService;
    private String telephoneService;
    private String emailService;
    private LocalDateTime dateCreation;
    private Boolean actif;
    private Integer nombreMedecins;
    private Integer nombreChambres;
}