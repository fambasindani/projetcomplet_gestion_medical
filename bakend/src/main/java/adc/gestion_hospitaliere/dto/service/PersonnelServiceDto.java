package adc.gestion_hospitaliere.dto.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PersonnelServiceDto {
    private Integer idPersonnel;
    private String nom;
    private String fonction;
}