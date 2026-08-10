
package adc.gestion_hospitaliere.dto.lot;


import adc.gestion_hospitaliere.Enums.StatutLot;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class LotRequestDto {
    @NotNull
    private Integer idMedicament;
    @NotBlank
    private String numeroLot;
    private Integer idFournisseur;
    private LocalDateTime dateFabrication;
    @NotNull
    private LocalDateTime datePeremption;
    @NotNull @Min(0)
    private Integer quantiteInitial;
    @Min(0)
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