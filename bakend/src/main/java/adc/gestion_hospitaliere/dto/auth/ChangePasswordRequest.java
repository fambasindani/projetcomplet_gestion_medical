package adc.gestion_hospitaliere.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ChangePasswordRequest {

    @NotBlank(message = "Le mot de passe actuel est requis")
    private String ancienMotDePasse;

    @NotBlank(message = "Le nouveau mot de passe est requis")
    @Size(min = 6, message = "Le nouveau mot de passe doit contenir au moins 6 caractères")
    private String nouveauMotDePasse;

    @NotBlank(message = "La confirmation est requise")
    private String confirmationMotDePasse;
}
