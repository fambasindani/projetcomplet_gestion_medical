package adc.gestion_hospitaliere.dto.Inventairepharmacie;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class LigneInventaireRequestDto {
    @NotNull
    private Integer idMedicament;
    @NotNull
    private Integer idLot;
    @NotNull
    private Integer quantiteTheorique;
    @NotNull
    private Integer quantiteReelle;
    private String raisonEcart;
    private BigDecimal prixUnitaire;
}