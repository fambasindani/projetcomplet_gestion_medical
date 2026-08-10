package adc.gestion_hospitaliere.dto.delivrance;
import adc.gestion_hospitaliere.Enums.MotifDelivrance;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
@Data
public class DelivranceUpdateDto {
    @NotNull
    private Integer idDelivrance;
    private String numeroOrdonnance;
    private Integer idPatient;
    private Integer idMedecinPrescripteur;
    private Integer idPrescriptionMed;
    @NotNull
    private MotifDelivrance motifDelivrance;
    private String observations;
    private Boolean signatureElectronique;
    private List<DetailDelivranceUpdateDto> details;
}
