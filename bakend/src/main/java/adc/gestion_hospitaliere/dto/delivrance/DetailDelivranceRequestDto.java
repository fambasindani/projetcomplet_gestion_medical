package adc.gestion_hospitaliere.dto.delivrance;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DetailDelivranceRequestDto {
    @NotNull(message = "L'ID du médicament est requis")
    private Integer idMedicament;

    @NotNull(message = "L'ID du lot est requis")
    private Integer idLot;

    @NotNull(message = "La quantité délivrée est requise")
    private Integer quantiteDelivree;

    @NotNull(message = "Le prix unitaire est requis")
    private BigDecimal prixUnitaire;

    private BigDecimal priseEnChargeMutuelle = BigDecimal.ZERO;
}