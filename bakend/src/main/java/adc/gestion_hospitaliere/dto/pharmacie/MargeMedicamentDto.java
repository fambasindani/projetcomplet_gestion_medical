package adc.gestion_hospitaliere.dto.pharmacie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MargeMedicamentDto {
    private Integer idMedicament;
    private String nomMedicament;
    private Integer quantiteDelivree;
    private Double prixVenteMoyen;
    private Double prixAchatMoyen;
    private Double chiffreAffaires;
    private Double coutAchat;
    private Double marge;
    private Double tauxMarge;
}
