package adc.gestion_hospitaliere.dto.urgence;

import adc.gestion_hospitaliere.Enums.GraviteUrgence;
import adc.gestion_hospitaliere.Enums.StatutAdmissionUrgence;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionUrgenceResponseDto {

    private Integer idAdmissionUrgence;
    private String numeroAdmission;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idMedecin;
    private String medecinNom;
    private String medecinPrenom;
    private LocalDateTime dateArrivee;
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
    private LocalDateTime dateCreation;
}
