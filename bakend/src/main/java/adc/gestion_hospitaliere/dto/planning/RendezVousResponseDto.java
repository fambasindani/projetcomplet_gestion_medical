package adc.gestion_hospitaliere.dto.planning;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class RendezVousResponseDto {
    private Integer idRdv;
    private LocalDateTime dateRdv;
    private String motif;
    private String statut;          // Programme, Confirme, Annule, Termine, NonPresente
    private String typeConsultation;
    private Integer dureeEstimee;

    // Patient
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;

    // Médecin (optionnel, mais utile)
    private Integer idMedecin;
    private String medecinNom;
    private String medecinPrenom;

    // Consultation existante ?
    private Integer idConsultation;
}