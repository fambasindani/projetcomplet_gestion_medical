package adc.gestion_hospitaliere.dto.facture;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElementFacturableDto {

    private String source;
    private Integer idActe;
    private Integer idMedicament;
    private Integer idHospitalisation;
    private String description;
    private Integer quantite;
    private Double prixUnitaire;
    private LocalDateTime dateElement;
}
