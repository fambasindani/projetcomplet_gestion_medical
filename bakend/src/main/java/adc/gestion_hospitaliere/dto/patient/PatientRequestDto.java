package adc.gestion_hospitaliere.dto.patient;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.GroupeSanguin;
import adc.gestion_hospitaliere.Enums.SituationFamiliale;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PatientRequestDto {
    @NotBlank @Size(max=20) private String numeroSecuriteSociale;
    @NotBlank @Size(max=50) private String nom;
    @NotBlank @Size(max=50) private String prenom;
    @NotNull private LocalDateTime dateNaissance;
    @Size(max=100) private String lieuNaissance;
    @NotNull private Genre genre;
    @Size(max=20) private String telephone;
    @Size(max=20) private String telephoneUrgent;
    @Email @Size(max=100) private String email;
    private String adresse;
    @Size(max=100) private String profession;
    private SituationFamiliale situationFamiliale;
    private GroupeSanguin groupeSanguin;
    private String allergies;
    private String antecedentsMedicaux;
    private String antecedentsChirurgicaux;
    private String traitementHabituel;
    @Size(max=100) private String mutuelle;
    @Size(max=50) private String numeroMutuelle;
    @Size(max=100) private String personneContactNom;
    @Size(max=50) private String personneContactLien;
    @Size(max=20) private String personneContactTelephone;
    private Boolean consentement;
}