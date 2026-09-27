package adc.gestion_hospitaliere.dto.laboratoire;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonnelAffecteDto {
    private Integer idPersonnel;
    private String nom;
    private String fonction;
}