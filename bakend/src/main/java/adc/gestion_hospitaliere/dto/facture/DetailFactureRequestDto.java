package adc.gestion_hospitaliere.dto.facture;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
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
    private String source;
    private Integer idSource;

    @NotBlank(message = "La description est requise")
    private String description;

    @Positive(message = "La quantité doit être strictement positive")
    private Integer quantite;

    @NotNull(message = "Le prix unitaire est requis")
    @PositiveOrZero(message = "Le prix unitaire ne peut pas être négatif")
    private Double prixUnitaire;

    @PositiveOrZero(message = "La remise ne peut pas être négative")
    private Double remise;
}
