

package adc.gestion_hospitaliere.dto.lot;

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
public class LotResponseDto {
    private Integer idLot;
    private Integer idMedicament;
    private String medicamentNom;
    private String numeroLot;
    private Integer idFournisseur;
    private String fournisseurNom;
    private LocalDateTime dateFabrication;
    private LocalDateTime datePeremption;
    private Integer quantiteInitial;
    private Integer quantiteRestante;
    private BigDecimal prixAchatUnitaire;
    private BigDecimal prixVenteUnitaire;
    private String emplacementStockage;
    private LocalDateTime dateReception;
    private String bonCommande;
    private String factureFournisseur;
    private Boolean controleQualite;
    private StatutLot statut;
    private String notes;
}