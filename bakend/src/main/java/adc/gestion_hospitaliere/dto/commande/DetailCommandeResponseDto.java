package adc.gestion_hospitaliere.dto.commande;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailCommandeResponseDto {
    private Integer idDetailCommande;
    private Integer idMedicament;
    private String medicamentNom;
    private Integer quantiteCommandee;
    private Integer quantiteRecue;
    private BigDecimal prixUnitaire;
    private BigDecimal remise;
    private BigDecimal totalLigne;
}
