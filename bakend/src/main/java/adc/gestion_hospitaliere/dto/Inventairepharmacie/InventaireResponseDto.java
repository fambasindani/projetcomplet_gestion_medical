package adc.gestion_hospitaliere.dto.Inventairepharmacie;
import adc.gestion_hospitaliere.Enums.StatutInventaire;
import adc.gestion_hospitaliere.Enums.TypeInventaire;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class InventaireResponseDto {
    private Integer idInventaire;
    private LocalDateTime dateInventaire;
    private TypeInventaire typeInventaire;
    private Integer realisePar;
    private String realisateurNom;
    private Integer validePar;
    private String validateurNom;
    private LocalDateTime dateValidation;
    private String observations;
    private StatutInventaire statut;
    private List<LigneInventaireResponseDto> lignes;
}