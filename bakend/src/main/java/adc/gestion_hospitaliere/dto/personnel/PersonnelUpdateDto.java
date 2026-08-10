package adc.gestion_hospitaliere.dto.personnel;

import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.TypeContrat;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;  // ← modifier l'import

@Data
public class PersonnelUpdateDto {
    private Integer idPersonnel;
    private String matricule;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;   // ← LocalDate
    private Genre genre;
    private String fonction;
    private String service;
    private String telephone;
    private String email;
    private String adresse;
    private LocalDate dateEmbauche;     // ← LocalDate
    private BigDecimal salaire;
    private TypeContrat typeContrat;
    private String photo;
}