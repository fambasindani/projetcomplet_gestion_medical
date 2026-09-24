package adc.gestion_hospitaliere.dto.urgence;

import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionUrgenceResponseDto {

    private Integer idInterventionUrgence;
    private String numeroIntervention;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idAdmissionUrgence;
    private Integer idMedecinPrincipal;
    private String medecinNom;
    private String medecinPrenom;
    private String typeIntervention;
    private Integer idActeCatalogue;
    private String libelleActeCatalogue;
    private Double prixActeCatalogue;
    private LocalDateTime dateIntervention;
    private String lieu;
    private Integer dureePrevue;
    private String actesRealises;
    private String materielUtilise;
    private String complications;
    private String resultat;
    private StatutInterventionUrgence statut;
    private String notes;
    private LocalDateTime dateCreation;
}
