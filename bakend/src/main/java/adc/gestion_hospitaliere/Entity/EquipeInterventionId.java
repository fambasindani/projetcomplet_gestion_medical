package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EquipeInterventionId implements Serializable {
    private Integer idIntervention;
    private Integer idMedecin;
}
