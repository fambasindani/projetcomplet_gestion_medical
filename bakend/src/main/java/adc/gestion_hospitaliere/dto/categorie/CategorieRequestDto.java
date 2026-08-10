package adc.gestion_hospitaliere.dto.categorie;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieRequestDto {
    @NotBlank(message = "Le nom de la catégorie est requis")
    @Size(max = 100)
    private String nomCategorie;
    private String description;
    @Size(max = 20)
    private String codeCategorie;
}