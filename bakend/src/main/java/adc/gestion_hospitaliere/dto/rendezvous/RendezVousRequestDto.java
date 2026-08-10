package adc.gestion_hospitaliere.dto.rendezvous;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousRequestDto {
    @NotNull(message = "L'ID du patient est requis")
    private Integer idPatient;
    @NotNull(message = "L'ID du médecin est requis")
    private Integer idMedecin;
    @NotNull(message = "La date du rendez-vous est requise")
    @Future(message = "La date doit être dans le futur")
    private LocalDateTime dateRdv;
    private String motif;
    private StatutRendezVous statut;
    private String typeConsultation;
    private Integer dureeEstimee;
    private String notesPreliminaires;
    private Boolean rappelEnvoye;
}
