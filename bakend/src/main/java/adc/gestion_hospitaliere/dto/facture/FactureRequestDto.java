package adc.gestion_hospitaliere.dto.facture;

import jakarta.validation.constraints.NotNull;
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
public class FactureRequestDto {

    @NotNull(message = "Le patient est requis")
    private Integer idPatient;

    private Integer idHospitalisation;
    private LocalDateTime dateEcheance;
    private Double tva;
    private Boolean assurancePriseEnCharge;
    private String mutuelleId;
    private Double mutuellePriseEnCharge;
    private String notesComptables;
    private List<DetailFactureRequestDto> details;
}
