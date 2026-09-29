package adc.gestion_hospitaliere.dto.service;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ServiceRequestDto {
    @NotBlank private String nom;
    private String pole;
    private String type;
    private String responsable;
    private Boolean actif;
}