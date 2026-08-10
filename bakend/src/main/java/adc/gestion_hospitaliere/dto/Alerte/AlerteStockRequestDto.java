package adc.gestion_hospitaliere.dto.Alerte;

import adc.gestion_hospitaliere.Enums.TypeAlerteStock;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AlerteStockRequestDto {
    private Integer idMedicament;
    private TypeAlerteStock typeAlerte;
    private Integer seuilActuel;
    private Integer seuilMinimum;
    private LocalDateTime datePeremption;
    private String actionEntreprise;
    private Boolean traitee;
    private Integer traiteePar;
}
