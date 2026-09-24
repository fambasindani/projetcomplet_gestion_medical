package adc.gestion_hospitaliere.dto.pharmacie;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RapportMargePharmacieDto {
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Double chiffreAffairesTotal;
    private Double coutAchatTotal;
    private Double margeTotale;
    private Double tauxMargeTotal;
    private Long nbDelivrances;
    private List<MargeMedicamentDto> parMedicament;
    private List<MargePharmacienDto> parPharmacien;
}
