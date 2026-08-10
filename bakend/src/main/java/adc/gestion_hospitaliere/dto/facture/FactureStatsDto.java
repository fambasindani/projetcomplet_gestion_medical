package adc.gestion_hospitaliere.dto.facture;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactureStatsDto {
    private long totalFactures;
    private Double totalMontantEmis;
    private Double totalPaye;
    private Double totalRestant;
    private List<Map<String, Object>> parStatut;
    private List<Map<String, Object>> parMois;
}
