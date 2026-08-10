package adc.gestion_hospitaliere.dto.urgence;

import adc.gestion_hospitaliere.Enums.GraviteUrgence;
import adc.gestion_hospitaliere.Enums.StatutAdmissionUrgence;
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
public class AdmissionUrgenceRequestDto {

    @Size(max = 20)
    private String numeroAdmission;

    @NotNull
    private Integer idPatient;

    private Integer idMedecin;

    @NotNull
    private LocalDateTime dateArrivee;

    @NotBlank
    private String motifUrgent;

    private GraviteUrgence gravite;

    private String symptomes;

    private String tensionArterielle;

    private Integer pouls;

    private Double temperature;

    private Integer saturationOxygene;

    private StatutAdmissionUrgence statut;

    private LocalDateTime datePriseEnCharge;

    private String orientation;

    private String notes;
}
