package adc.gestion_hospitaliere.dto.laboratoire;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class LaboratoireResponseDto {
    private Integer idLaboratoire;
    private String nom;
    private String type;
    private String responsable;
    private String accreditation;
    private Boolean actif;
    private LocalDateTime dateCreation;
    private List<PersonnelAffecteDto> personnel;
}