package adc.gestion_hospitaliere.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.io.Serializable;

@Entity
@Table(name = "personnel_laboratoire")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(PersonnelLaboratoireId.class)
public class PersonnelLaboratoire implements Serializable {

    @Id
    @Column(name = "id_personnel")
    private Integer idPersonnel;

    @Id
    @Column(name = "id_laboratoire")
    private Integer idLaboratoire;
}