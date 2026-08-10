package adc.gestion_hospitaliere.dto.commande;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailCommandeRequestDto {
    @NotNull
    private Integer idMedicament;
    @NotNull
    private Integer quantiteCommandee;
    private Integer quantiteRecue;
    private BigDecimal prixUnitaire;
    private BigDecimal remise;
    private BigDecimal totalLigne;
}
