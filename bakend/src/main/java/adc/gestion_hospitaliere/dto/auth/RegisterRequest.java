package adc.gestion_hospitaliere.dto.auth;



import adc.gestion_hospitaliere.Enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Le nom est requis")
    @Size(max = 100)
    private String nom;

    @NotBlank(message = "Le prénom est requis")
    @Size(max = 100)
    private String prenom;

    @NotBlank(message = "L'email est requis")
    @Email
    @Size(max = 150)
    private String email;

    @NotBlank(message = "Le mot de passe est requis")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @NotBlank(message = "La confirmation du mot de passe est requise")
    private String confirmPassword;

    @NotNull(message = "Le rôle est requis")
    private Role role;
}