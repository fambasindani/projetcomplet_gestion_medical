package adc.gestion_hospitaliere.dto.inventaire;

import adc.gestion_hospitaliere.Enums.StatutLot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LigneStockTheoriqueDto {
    private Integer idMedicament;
    private String medicamentNom;
    private Integer idLot;
    private String numeroLot;
    private Integer quantiteTheorique;
    private BigDecimal prixUnitaire;
    private StatutLot statutLot;
    private LocalDateTime datePeremption;
}
