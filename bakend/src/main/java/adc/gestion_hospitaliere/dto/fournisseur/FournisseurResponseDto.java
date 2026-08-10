package adc.gestion_hospitaliere.dto.fournisseur;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FournisseurResponseDto {
    private Integer idFournisseur;
    private String nomFournisseur;
    private String contactNom;
    private String contactFonction;
    private String telephone;
    private String email;
    private String adresse;
    private String siteWeb;
    private String siret;
    private String numeroAgrement;
    private String conditionsPaiement;
    private Integer delaiLivraison;
    private BigDecimal note;
    private Boolean actif;
}