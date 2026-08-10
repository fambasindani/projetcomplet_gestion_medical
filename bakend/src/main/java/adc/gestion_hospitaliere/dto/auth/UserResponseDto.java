package adc.gestion_hospitaliere.dto.auth;

import adc.gestion_hospitaliere.Enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class UserResponseDto {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Role role;
    private boolean actif;
    private Integer personnelId;   // optionnel, si l’utilisateur est lié à un personnel
    private LocalDateTime dateCreation;
    private LocalDateTime dateModification;
}
