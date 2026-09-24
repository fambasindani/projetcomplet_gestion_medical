package adc.gestion_hospitaliere.dto.catalogue;

import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeActeResponseDto {
    private Integer idGroupe;
    private String libelle;
    private CategorieActeMedical categorie;
    private String description;
    private Boolean actif;
}
