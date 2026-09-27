package adc.gestion_hospitaliere.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonnelLaboratoireId implements Serializable {
    private Integer idPersonnel;
    private Integer idLaboratoire;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PersonnelLaboratoireId that)) return false;
        return Objects.equals(idPersonnel, that.idPersonnel)
                && Objects.equals(idLaboratoire, that.idLaboratoire);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPersonnel, idLaboratoire);
    }
}