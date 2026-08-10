package adc.gestion_hospitaliere.dto.auth;


import adc.gestion_hospitaliere.Enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserCreateFromPersonnelRequest {
    @NotNull
    private Integer personnelId;
    @NotBlank @Email
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String confirmPassword;
    @NotNull
    private Role role;
}
