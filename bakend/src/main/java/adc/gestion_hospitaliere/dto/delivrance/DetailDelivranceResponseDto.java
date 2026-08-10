package adc.gestion_hospitaliere.dto.delivrance;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class DetailDelivranceResponseDto {
    private Integer idDetailDelivrance;
    private Integer idMedicament;
    private String medicamentNom;
    private Integer idLot;
    private String lotNumero;
    private Integer quantiteDelivree;
    private BigDecimal prixUnitaire;
    private BigDecimal montantLigne;
    private BigDecimal priseEnChargeMutuelle;
    private BigDecimal resteACharge;
}