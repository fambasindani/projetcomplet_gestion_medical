package adc.gestion_hospitaliere.dto.prescription;

import adc.gestion_hospitaliere.Enums.StatutPrescription;
import adc.gestion_hospitaliere.Enums.TypePrescription;
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
public class PrescriptionRequestDto {
    private String numeroPrescription;      // optionnel (généré)
    private Integer idConsultation;
    private Integer idHospitalisation;
    private Integer idMedecin;
    private Integer idPatient;
    private LocalDateTime datePrescription;
    private TypePrescription typePrescription;
    private String description;
    private String instructions;
    private Boolean urgente;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private StatutPrescription statut;
    private String motifAnnulation;
    private String notesComplementaires;
    private List<PrescriptionMedicamentRequestDto> prescriptionsMedicaments; // ← ajout

}