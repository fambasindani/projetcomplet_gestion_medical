package adc.gestion_hospitaliere.dto.Inventairepharmacie;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class LigneInventaireResponseDto {
    private Integer idLigneInventaire;
    private Integer idMedicament;
    private String medicamentNom;
    private Integer idLot;
    private String lotNumero;
    private Integer quantiteTheorique;
    private Integer quantiteReelle;
    private Integer ecart;
    private String raisonEcart;
    private BigDecimal prixUnitaire;
    private BigDecimal valeurEcart;
}