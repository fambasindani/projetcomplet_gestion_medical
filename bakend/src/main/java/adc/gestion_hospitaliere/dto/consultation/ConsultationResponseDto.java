package adc.gestion_hospitaliere.dto.consultation;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class ConsultationResponseDto {
    private Integer idConsultation;
    private Integer idRdv;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idMedecin;
    private String medecinNom;
    private String medecinPrenom;
    private LocalDateTime dateConsultation;
    private String motifConsultation;
    private String histoireMaladie;
    private String diagnostic;
    private String traitementPrescris;
    private String observations;
    private BigDecimal temperature;
    private Integer pouls;
    private Integer pressionSystolique;
    private Integer pressionDiastolique;
    private Integer saturation;
    private BigDecimal glycemie;
    private BigDecimal poids;
    private BigDecimal taille;
    private BigDecimal imc;
    private String certificatMedical;
    private LocalDateTime arretTravailDebut;
    private LocalDateTime arretTravailFin;
    private String evolution;
    private LocalDateTime prochainRdv;
    private String notesConfidentielles;
    private LocalDateTime dateCreation; // optionnel
}
