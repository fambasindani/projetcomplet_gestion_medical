package adc.gestion_hospitaliere.dto.urgence;

import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionUrgenceRequestDto {

    @Size(max = 20)
    private String numeroIntervention;

    @NotNull
    private Integer idPatient;

    private Integer idAdmissionUrgence;

    @NotNull
    private Integer idMedecinPrincipal;

    @NotBlank
    private String typeIntervention;

    @NotNull
    private LocalDateTime dateIntervention;

    private String lieu;

    private Integer dureePrevue;

    private String actesRealises;

    private String materielUtilise;

    private String complications;

    private String resultat;

    private StatutInterventionUrgence statut;

    private String notes;
}
