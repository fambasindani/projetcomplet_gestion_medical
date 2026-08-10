package adc.gestion_hospitaliere.dto.fournisseur;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FournisseurRequestDto {
    @NotBlank
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