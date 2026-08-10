package adc.gestion_hospitaliere.dto.Inventairepharmacie;

import adc.gestion_hospitaliere.Enums.StatutInventaire;
import lombok.Data;

@Data
public class InventaireUpdateDto {
    private StatutInventaire statut;
    private String observations;
}
