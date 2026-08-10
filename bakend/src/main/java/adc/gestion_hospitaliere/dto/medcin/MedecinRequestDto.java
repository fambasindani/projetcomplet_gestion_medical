package adc.gestion_hospitaliere.dto.medcin;
import adc.gestion_hospitaliere.Enums.Disponibilite;
import adc.gestion_hospitaliere.Enums.Genre;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MedecinRequestDto {

    @NotBlank(message = "Le matricule est obligatoire")
    @Size(max = 20)
    private String matricule;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 50)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 50)
    private String prenom;

    private LocalDateTime dateNaissance;

    @Size(max = 100)
    private String lieuNaissance;

    @NotNull(message = "Le genre est obligatoire")
    private Genre genre;

    @Size(max = 20)
    private String telephone;

    @Email
    @Size(max = 100)
    private String email;

    private String adresse;

    private Integer idSpecialite;

    @Size(max = 100)
    private String qualification;

    @Size(max = 200)
    private String diplome;

    @Size(max = 50)
    private String numeroOrdre;

    private LocalDateTime dateEmbauche;

    @DecimalMin("0.0")
    private Double salaire;

    private Disponibilite disponibilite;

    @Size(max = 255)
    private String photo;

    private String notes;
}