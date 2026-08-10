package adc.gestion_hospitaliere.dto.medicament;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicamentRequestDto {
    @NotBlank
    private String codeCip;
    private String codeCis;
    @NotBlank
    private String nomCommercial;
    private String denominationCommune;
    private String formePharmaceutique;
    private String dosage;
    private String presentation;
    private String voieAdministration;
    private Integer idCategorie;
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
    private BigDecimal prixAchat;
    private BigDecimal prixVente;
    private Integer tauxRemboursement;
    private Integer stockMinimum;
    private Integer stockMaximum;
    private Integer datePeremptionAlerte;
    private Boolean actif;
}