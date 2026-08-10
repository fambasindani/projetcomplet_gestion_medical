package adc.gestion_hospitaliere.dto.categorie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieResponseDto {
    private Integer idCategorie;
    private String nomCategorie;
    private String description;
    private String codeCategorie;
    private Integer nombreMedicaments; // optionnel, pour info
}