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
public class PrescriptionMedicamentResponseDto {
    private Integer idPrescriptionMed;
    private Integer idPrescription;
    private Integer idMedicament;
    private String medicamentNom;
    private Integer idLot;
    private String lotNumero;
    private String posologie;
    private String dureeTraitement;
    private Integer quantitePrescrite;
    private Integer quantiteDelivree;
    private String instructions;
    private Boolean renouvelable;
    private Integer nombreRenouvellements;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
}