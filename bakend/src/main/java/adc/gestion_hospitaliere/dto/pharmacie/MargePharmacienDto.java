package adc.gestion_hospitaliere.dto.pharmacie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MargePharmacienDto {
    private Integer idPharmacien;
    private String nomPharmacien;
    private Long nbDelivrances;
    private Double chiffreAffaires;
    private Double coutAchat;
    private Double marge;
    private Double tauxMarge;
}
