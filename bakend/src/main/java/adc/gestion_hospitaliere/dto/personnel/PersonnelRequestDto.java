package adc.gestion_hospitaliere.dto.personnel;

import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.TypeContrat;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PersonnelRequestDto {
    @NotBlank(message = "Le matricule est requis")
    private String matricule;

    @NotBlank(message = "Le nom est requis")
    private String nom;

    @NotBlank(message = "Le prénom est requis")
    private String prenom;

    private LocalDate dateNaissance;  // ← LocalDate (évite l'erreur de parsing)

    @NotNull(message = "Le genre est requis")
    private Genre genre;

    @NotBlank(message = "La fonction est requise")   // ← rétabli
    private String fonction;

    private String service;
    private String telephone;

    @Email(message = "Email invalide")
    private String email;

    private String adresse;
    private LocalDate dateEmbauche;   // ← LocalDate

    @DecimalMin(value = "0.0", message = "Le salaire doit être positif")
    private BigDecimal salaire;

    private TypeContrat typeContrat;
    private String photo;
}