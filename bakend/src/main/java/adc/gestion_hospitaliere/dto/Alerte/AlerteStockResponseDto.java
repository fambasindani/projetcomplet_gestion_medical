package adc.gestion_hospitaliere.dto.Alerte;
import adc.gestion_hospitaliere.Enums.TypeAlerteStock;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class AlerteStockResponseDto {
    private Integer idAlerte;
    private Integer idMedicament;
    private String medicamentNom;
    private TypeAlerteStock typeAlerte;
    private Integer seuilActuel;
    private Integer seuilMinimum;
    private LocalDateTime datePeremption;
    private LocalDateTime dateAlerte;
    private Boolean traitee;
    private LocalDateTime dateTraitement;
    private Integer traiteePar;
    private String traiteurNom;
    private String actionEntreprise;
}
