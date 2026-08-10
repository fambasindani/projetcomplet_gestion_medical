package adc.gestion_hospitaliere.dto.categorieExamen;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class CategorieExamenResponseDto {
    private Integer idCategorieExamen;
    private String code;
    private String libelle;
    private String description;
    private Boolean actif;
    private LocalDateTime dateCreation;
}