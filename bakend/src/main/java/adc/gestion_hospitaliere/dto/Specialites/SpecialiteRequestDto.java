package adc.gestion_hospitaliere.dto.Specialites;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SpecialiteRequestDto {

    @NotBlank(message = "Le nom de la spécialité est requis")
    @Size(max = 100)
    private String nomSpecialite;

    private String description;

    @Size(max = 100)
    private String chefService;

    @Size(max = 20)
    private String telephoneService;

    @Size(max = 100)
    private String emailService;

    private Boolean actif = true;
}