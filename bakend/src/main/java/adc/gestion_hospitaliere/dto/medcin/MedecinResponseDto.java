package adc.gestion_hospitaliere.dto.medcin;
import adc.gestion_hospitaliere.Enums.Disponibilite;
import adc.gestion_hospitaliere.Enums.Genre;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MedecinResponseDto {
    private Integer idMedecin;
    private String matricule;
    private String nom;
    private String prenom;
    private LocalDateTime dateNaissance;
    private String lieuNaissance;
    private Genre genre;
    private String telephone;
    private String email;
    private String adresse;
    private Integer idSpecialite;
    private String nomSpecialite;
    private String qualification;
    private String diplome;
    private String numeroOrdre;
    private LocalDateTime dateEmbauche;
    private Double salaire;
    private Disponibilite disponibilite;
    private String photo;
    private String notes;
    private LocalDateTime dateCreation;
}