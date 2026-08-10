package adc.gestion_hospitaliere.dto.facture;

import adc.gestion_hospitaliere.Enums.ModePaiement;
import adc.gestion_hospitaliere.Enums.StatutPaiement;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaiementResponseDto {
    private Integer idPaiement;
    private Integer idFacture;
    private LocalDateTime datePaiement;
    private Double montant;
    private ModePaiement modePaiement;
    private String referencePaiement;
    private Integer encaissePar;
    private String encaisseurNom;
    private StatutPaiement statut;
    private String notes;
}
