package adc.gestion_hospitaliere.dto.prescription;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicamentRequestDto {
    private Integer idMedicament;
    private Integer idLot;
    private String medicamentNom;
    private String posologie;
    private String dureeTraitement;
    private Integer quantitePrescrite;
    private String instructions;
    private Boolean renouvelable;
    private Integer nombreRenouvellements;
    private Integer quantiteDelivree;      // ← ajouté
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private Boolean isCustom;
}