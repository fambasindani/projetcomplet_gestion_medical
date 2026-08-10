package adc.gestion_hospitaliere.dto.patient;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.GroupeSanguin;
import adc.gestion_hospitaliere.Enums.SituationFamiliale;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class PatientResponseDto {
    private Integer idPatient;
    private String numeroSecuriteSociale;
    private String nom;
    private String prenom;
    private LocalDateTime dateNaissance;
    private String lieuNaissance;
    private Genre genre;
    private String telephone;
    private String telephoneUrgent;
    private String email;
    private String adresse;
    private String profession;
    private SituationFamiliale situationFamiliale;
    private GroupeSanguin groupeSanguin;
    private String allergies;
    private String antecedentsMedicaux;
    private String antecedentsChirurgicaux;
    private String traitementHabituel;
    private String mutuelle;
    private String numeroMutuelle;
    private String personneContactNom;
    private String personneContactLien;
    private String personneContactTelephone;
    private LocalDateTime dateEnregistrement;
    private Boolean consentement;
}