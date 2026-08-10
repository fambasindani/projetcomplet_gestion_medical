package adc.gestion_hospitaliere.dto.inventaire;

import adc.gestion_hospitaliere.Enums.TypeInventaire;
import adc.gestion_hospitaliere.dto.Inventairepharmacie.LigneInventaireRequestDto;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class InventaireRequestDto {
    @NotNull
    private LocalDateTime dateInventaire;
    @NotNull
    private TypeInventaire typeInventaire;
    @NotNull
    private Integer realisePar;
    private Integer validePar;
    private String observations;
    private List<LigneInventaireRequestDto> lignes;
}