package adc.gestion_hospitaliere.dto.chambre;


import adc.gestion_hospitaliere.Enums.StatutChambre;
import adc.gestion_hospitaliere.Enums.TypeChambre;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChambreResponseDto {
    private Integer idChambre;
    private String numeroChambre;
    private Integer etage;
    private String batiment;
    private TypeChambre typeChambre;
    private StatutChambre statut;
    private Double prixJour;
    private Integer idSpecialite;
    private String nomSpecialite;       // pour affichage
    private String equipements;
    private Boolean telephone;
    private Boolean television;
    private Boolean wifi;
    private Boolean salleBainPrivee;
    private Boolean accessibiliteHandicape;
    private String notes;
    private Integer nombreHospitalisations; // pour info
}