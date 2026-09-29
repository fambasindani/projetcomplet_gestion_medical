package adc.gestion_hospitaliere.Entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonnelServiceId implements Serializable {
    private Integer idPersonnel;
    private Integer idService;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PersonnelServiceId that)) return false;
        return Objects.equals(idPersonnel, that.idPersonnel)
                && Objects.equals(idService, that.idService);
    }

    @Override
    public int hashCode() {
        return Objects.hash(idPersonnel, idService);
    }
}