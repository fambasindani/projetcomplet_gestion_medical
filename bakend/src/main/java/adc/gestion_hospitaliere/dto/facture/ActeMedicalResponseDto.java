package adc.gestion_hospitaliere.dto.facture;

import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActeMedicalResponseDto {
    private Integer idActe;
    private String codeActe;
    private String libelle;
    private String description;
    private Double prixBase;
    private CategorieActeMedical categorie;
    private Double coefficient;
    private String lettreCle;
    private Boolean remboursable;
    private Integer tauxRemboursement;
    private Boolean actif;
}
