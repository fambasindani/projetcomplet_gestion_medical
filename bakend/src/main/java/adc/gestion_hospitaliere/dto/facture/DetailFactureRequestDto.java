package adc.gestion_hospitaliere.dto.facture;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailFactureRequestDto {

    private Integer idActe;
    private Integer idMedicament;

    @NotBlank(message = "La description est requise")
    private String description;

    private Integer quantite;

    @NotNull(message = "Le prix unitaire est requis")
    private Double prixUnitaire;

    private Double remise;
}
