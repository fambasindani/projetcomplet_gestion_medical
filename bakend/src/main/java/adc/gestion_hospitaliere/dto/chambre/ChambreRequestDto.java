package adc.gestion_hospitaliere.dto.chambre;



import adc.gestion_hospitaliere.Enums.StatutChambre;
import adc.gestion_hospitaliere.Enums.TypeChambre;
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
public class ChambreRequestDto {
    @NotBlank(message = "Le numéro de chambre est requis")
    private String numeroChambre;

    private Integer etage;
    private String batiment;

    @NotNull(message = "Le type de chambre est requis")
    private TypeChambre typeChambre;

    private StatutChambre statut; // optionnel, défaut Disponible

    private Double prixJour;

    private Integer idSpecialite; // facultatif

    private String equipements;
    private Boolean telephone;
    private Boolean television;
    private Boolean wifi;
    private Boolean salleBainPrivee;
    private Boolean accessibiliteHandicape;
    private String notes;
}
