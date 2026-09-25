package adc.gestion_hospitaliere.dto.facture;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactureRequestDto {

    @NotNull(message = "Le patient est requis")
    private Integer idPatient;

    private Integer idHospitalisation;
    private Integer idConsultation;
    private LocalDateTime dateEcheance;

    @PositiveOrZero(message = "Le taux de TVA ne peut pas être négatif")
    private Double tva;

    private Boolean assurancePriseEnCharge;

    // Taux de couverture du régime obligatoire (ex. 70 % France, 75 % Belgique).
    @PositiveOrZero(message = "Le taux de couverture assurance ne peut pas être négatif")
    private Double tauxAssurance;

    private String mutuelleId;

    @PositiveOrZero(message = "Le montant de prise en charge mutuelle ne peut pas Ǧtre nǸgatif")
    private Double mutuellePriseEnCharge;

    private String notesComptables;
    private List<DetailFactureRequestDto> details;
}
