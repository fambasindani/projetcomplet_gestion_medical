package adc.gestion_hospitaliere.dto.delivrance;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class DetailDelivranceUpdateDto {
    private Integer idDetailDelivrance; // peut être null pour les nouveaux
    @NotNull
    private Integer idMedicament;
    @NotNull
    private Integer idLot;
    @NotNull
    private Integer quantiteDelivree;
    @NotNull
    private BigDecimal prixUnitaire;
    private BigDecimal priseEnChargeMutuelle;
}
