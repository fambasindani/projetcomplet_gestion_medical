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
public class EquivalentsMedicamentsId implements Serializable {
    private Integer idMedicament1;
    private Integer idMedicament2;
}