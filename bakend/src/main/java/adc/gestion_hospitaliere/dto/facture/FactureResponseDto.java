package adc.gestion_hospitaliere.dto.facture;

import adc.gestion_hospitaliere.Enums.StatutFacture;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FactureResponseDto {
    private Integer idFacture;
    private String numeroFacture;
    private Integer idPatient;
    private String patientNom;
    private String patientPrenom;
    private Integer idHospitalisation;
    private Integer idConsultation;
    private LocalDateTime dateEmission;
    private LocalDateTime dateEcheance;
    private Double montantHt;
    private Double tva;
    private Double montantTtc;
    private Double montantPaye;
    private Double montantRestant;
    private StatutFacture statut;
    private String modePaiement;
    private Boolean assurancePriseEnCharge;
    private String mutuelleId;
    private Double mutuellePriseEnCharge;
    private LocalDateTime datePaiementTotal;
    private String notesComptables;
    private List<DetailFactureResponseDto> details;
    private List<PaiementResponseDto> paiements;
}
