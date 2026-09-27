package adc.gestion_hospitaliere.dto.commande;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

/** Donnees saisies lors de la reception d'une commande fournisseur. */
@Data
public class ReceptionCommandeRequestDto {

    private Boolean complete = true;

    private List<LigneReception> lignes;

    @Data
    public static class LigneReception {
        private Integer idDetailCommande;
        private Integer quantiteRecue;
        private String numeroLot;
        private LocalDateTime datePeremption;
        private String emplacementStockage;
        private java.math.BigDecimal prixVenteUnitaire;
    }
}