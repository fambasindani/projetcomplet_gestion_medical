package adc.gestion_hospitaliere.dto.auth;


import adc.gestion_hospitaliere.Enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserUpdateDto {
    @NotNull
    private Long id;
    @Email
    private String email;          // optionnel, si changement d’email
    private Role role;             // optionnel
    private Boolean isActive;      // optionnel
    private String password;       // optionnel, si nouveau mot de passe
    private String confirmPassword;
    private Integer personnelId;   // optionnel, pour changer de personnel associé
}
