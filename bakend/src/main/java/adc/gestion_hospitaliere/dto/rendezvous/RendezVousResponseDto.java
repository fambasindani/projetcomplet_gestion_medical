package adc.gestion_hospitaliere.dto.rendezvous;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousResponseDto {
    private Integer idRdv;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idMedecin;
    private String medecinNom;
    private String medecinPrenom;
    private String medecinSpecialite;
    private LocalDateTime dateRdv;
    private String motif;
    private StatutRendezVous statut;
    private String typeConsultation;
    private Integer dureeEstimee;
    private String notesPreliminaires;
    private LocalDateTime dateAnnulation;
    private String motifAnnulation;
    private Boolean rappelEnvoye;
}
