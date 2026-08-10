package adc.gestion_hospitaliere.dto.consultation;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ConsultationRequestDto {
    private Integer idRdv; // optionnel
    @NotNull private Integer idPatient;
    @NotNull private Integer idMedecin;
    @NotNull private LocalDateTime dateConsultation;
    @NotNull private String motifConsultation;
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
    private String certificatMedical;
    private LocalDateTime arretTravailDebut;
    private LocalDateTime arretTravailFin;
    private String evolution; // Favorable, Stationnaire, Defavorable
    private LocalDateTime prochainRdv;
    private String notesConfidentielles;
}