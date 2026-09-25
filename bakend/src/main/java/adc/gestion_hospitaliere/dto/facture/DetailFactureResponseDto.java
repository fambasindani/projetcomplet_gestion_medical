package adc.gestion_hospitaliere.dto.facture;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailFactureResponseDto {
    private Integer idDetail;
    private Integer idFacture;
    private Integer idActe;
    private String acteLibelle;
    private Integer idActeCatalogue;
    private String acteCatalogueLibelle;
    private Integer idMedicament;
    private String medicamentNom;
    private String source;
    private String description;
    private Integer quantite;
    private Double prixUnitaire;
    private Double remise;
    private Double montantHt;
    private Double montantTtc;
}
