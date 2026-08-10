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
public class PrescriptionResponseDto {
    private Integer idPrescription;
    private String numeroPrescription;
    private Integer idConsultation;
    private Integer idHospitalisation;
    private Integer idMedecin;
    private String medecinNom;
    private String medecinPrenom;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private LocalDateTime datePrescription;
    private TypePrescription typePrescription;
    private String description;
    private String instructions;
    private Boolean urgente;
    private LocalDateTime dateDebut;
    private LocalDateTime dateFin;
    private StatutPrescription statut;
    private LocalDateTime dateAnnulation;
    private String motifAnnulation;
    private String notesComplementaires;

    private List<PrescriptionMedicamentResponseDto> prescriptionsMedicaments;
}