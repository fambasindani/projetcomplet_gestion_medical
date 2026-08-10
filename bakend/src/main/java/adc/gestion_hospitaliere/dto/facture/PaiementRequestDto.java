package adc.gestion_hospitaliere.dto.facture;

import adc.gestion_hospitaliere.Enums.ModePaiement;
import jakarta.validation.constraints.NotNull;
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
    private Double montant;

    private ModePaiement modePaiement;
    private String referencePaiement;
    private Integer encaissePar;
    private String notes;
}
