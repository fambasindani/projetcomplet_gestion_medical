package adc.gestion_hospitaliere.dto.delivrance;

import adc.gestion_hospitaliere.Enums.MotifDelivrance;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class DelivranceRequestDto {
    private String numeroOrdonnance;
    @NotNull(message = "L'ID du patient est requis")
    private Integer idPatient;
    private Integer idMedecinPrescripteur;
    private Integer idPrescriptionMed;
    @NotNull(message = "Le motif de délivrance est requis")
    private MotifDelivrance motifDelivrance;
    private String observations;
    private Boolean signatureElectronique;
    @NotNull(message = "La liste des médicaments délivrés est requise")
    private List<DetailDelivranceRequestDto> details;
}