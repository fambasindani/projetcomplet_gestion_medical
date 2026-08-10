package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.RoleEquipe;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "equipe_intervention")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipeIntervention {

    @EmbeddedId
    private EquipeInterventionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idIntervention")
    @JoinColumn(name = "id_intervention")
    private Intervention intervention;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idMedecin")
    @JoinColumn(name = "id_medecin")
    private Medecin medecin;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false)
    private RoleEquipe role;
}