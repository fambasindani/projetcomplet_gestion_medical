package adc.gestion_hospitaliere.dto.personnel;

import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.TypeContrat;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class PersonnelResponseDto {
    private Integer idPersonnel;
    private String matricule;
    private String nom;
    private String prenom;
    private LocalDateTime dateNaissance;
    private Genre genre;
    private String fonction;
    private String service;
    private String telephone;
    private String email;
    private String adresse;
    private LocalDateTime dateEmbauche;
    private BigDecimal salaire;
    private TypeContrat typeContrat;
    private String photo;
    private LocalDateTime dateCreation; // si présent dans l'entité
}