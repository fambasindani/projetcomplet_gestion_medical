package adc.gestion_hospitaliere.dto.service;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ServiceResponseDto {
    private Integer idService;
    private String nom;
    private String pole;
    private String type;
    private String responsable;
    private Boolean actif;
    private LocalDateTime dateCreation;
    private List<PersonnelServiceDto> personnel;
}