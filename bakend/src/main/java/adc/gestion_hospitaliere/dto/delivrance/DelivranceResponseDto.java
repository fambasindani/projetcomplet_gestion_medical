package adc.gestion_hospitaliere.dto.delivrance;

import adc.gestion_hospitaliere.Enums.MotifDelivrance;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DelivranceResponseDto {
    private Integer idDelivrance;
    private String numeroOrdonnance;
    private Integer idPatient;
    private String patientNom;
    private Integer idMedecinPrescripteur;
    private String medecinNom;
    private Integer idPrescriptionMed;
    private LocalDateTime dateDelivrance;
    private Integer idPharmacien;
    private String pharmacienNom;
    private MotifDelivrance motifDelivrance;
    private String observations;
    private Boolean signatureElectronique;
    private List<DetailDelivranceResponseDto> details;
}