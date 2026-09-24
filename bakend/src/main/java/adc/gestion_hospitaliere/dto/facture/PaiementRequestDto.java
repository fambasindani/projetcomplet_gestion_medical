package adc.gestion_hospitaliere.dto.facture;

import adc.gestion_hospitaliere.Enums.ModePaiement;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaiementRequestDto {

    @NotNull(message = "Le montant est requis")
    @Positive(message = "Le montant doit être supérieur à zéro")
    private Double montant;

    private ModePaiement modePaiement;
    private String referencePaiement;
    private Integer encaissePar;
    private String notes;
}
