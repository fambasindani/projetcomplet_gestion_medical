package adc.gestion_hospitaliere.dto.catalogue;

import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
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
public class ActeCatalogueResponseDto {
    private Integer idActeCatalogue;
    private String code;
    private String libelle;
    private Integer idGroupe;
    private String groupeLibelle;
    private CategorieActeMedical categorie;
    private BigDecimal prixDefaut;
    private String description;
    private Boolean actif;
    private LocalDateTime dateCreation;
}
