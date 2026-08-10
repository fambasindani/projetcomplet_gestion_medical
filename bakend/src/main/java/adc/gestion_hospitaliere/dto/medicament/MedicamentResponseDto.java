package adc.gestion_hospitaliere.dto.medicament;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentResponseDto {
    private Integer idMedicament;
    private String codeCip;
    private String codeCis;
    private String nomCommercial;
    private String denominationCommune;
    private String formePharmaceutique;
    private String dosage;
    private String presentation;
    private String voieAdministration;
    private Integer idCategorie;
    private String nomCategorie; // pour affichage
    private String laboratoire;
    private String substanceActive;
    private String excipients;
    private String indications;
    private String contreIndications;
    private String effetsSecondaires;
    private String precautionsEmploi;
    private String conservationConditions;
    private String temperatureConservation;
    private Integer dureeConservationMois;
    private Boolean prescriptionObligatoire;
    private Boolean listePsychotrope;
    private Boolean generique;
    private Integer idGeneriqueParent;
    private String nomGeneriqueParent; // pour affichage
    private BigDecimal prixAchat;
    private BigDecimal prixVente;
    private Integer tauxRemboursement;
    private Integer stockMinimum;
    private Integer stockMaximum;
    private LocalDateTime dateCreation;
    private Integer datePeremptionAlerte;
    private Boolean actif;
}