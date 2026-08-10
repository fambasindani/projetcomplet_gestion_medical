package adc.gestion_hospitaliere.dto.Alerte;

import lombok.Data;

@Data
public class AlerteStockUpdateDto {
    private Boolean traitee;
    private Integer traiteePar;
    private String actionEntreprise;
}
