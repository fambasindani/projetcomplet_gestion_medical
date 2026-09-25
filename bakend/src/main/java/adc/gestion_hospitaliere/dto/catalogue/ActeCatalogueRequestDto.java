package adc.gestion_hospitaliere.dto.catalogue;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ActeCatalogueRequestDto {

    @NotBlank(message = "Le code est requis")
    private String code;

    @NotBlank(message = "Le libellé est requis")
    private String libelle;

    @NotNull(message = "Le groupe est requis")
    private Integer idGroupe;

    @NotNull(message = "Le prix par défaut est requis")
    private BigDecimal prixDefaut;

    // Cotation
    private BigDecimal coefficient;
    private String lettreCle;
    private Boolean remboursable;
    private BigDecimal tauxRemboursement;

    private String description;

    private Boolean actif;
}
