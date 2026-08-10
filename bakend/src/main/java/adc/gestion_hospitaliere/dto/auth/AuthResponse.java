package adc.gestion_hospitaliere.dto.auth;



import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private String role;
    private String token;
    private String refreshToken;
    private Long expiresIn;
}
