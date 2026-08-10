package adc.gestion_hospitaliere.dto.commande;

import adc.gestion_hospitaliere.Enums.StatutCommandeFournisseur;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommandeFournisseurResponseDto {
    private Integer idCommande;
    private String numeroCommande;
    private Integer idFournisseur;
    private String fournisseurNom;
    private LocalDateTime dateCommande;
    private LocalDateTime dateLivraisonPrevue;
    private LocalDateTime dateLivraisonReelle;
    private StatutCommandeFournisseur statut;
    private BigDecimal montantTotal;
    private String modePaiement;
    private Boolean paiementEffectue;
    private String notes;
    private Integer commandePar;
    private String commandeurNom;
    private List<DetailCommandeResponseDto> details;
}

