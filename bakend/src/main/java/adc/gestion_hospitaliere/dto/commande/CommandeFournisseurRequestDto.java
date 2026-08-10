package adc.gestion_hospitaliere.dto.commande;

import adc.gestion_hospitaliere.Enums.StatutCommandeFournisseur;
import jakarta.validation.constraints.NotNull;
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
public class CommandeFournisseurRequestDto {
    private String numeroCommande; // optionnel, généré si absent
    @NotNull
    private Integer idFournisseur;
    private LocalDateTime dateLivraisonPrevue;
    private LocalDateTime dateLivraisonReelle;
    private StatutCommandeFournisseur statut;
    private BigDecimal montantTotal;
    private String modePaiement;
    private Boolean paiementEffectue;
    private String notes;
    private Integer commandePar;
    private List<DetailCommandeRequestDto> details;
}

