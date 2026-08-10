package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fournisseurs_pharma")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FournisseurPharma {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_fournisseur")
    private Integer idFournisseur;

    @Column(name = "nom_fournisseur", nullable = false, length = 150)
    private String nomFournisseur;

    @Column(name = "contact_nom", length = 100)
    private String contactNom;

    @Column(name = "contact_fonction", length = 100)
    private String contactFonction;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "adresse", columnDefinition = "NVARCHAR(MAX)")
    private String adresse;

    @Column(name = "site_web", length = 100)
    private String siteWeb;

    @Column(name = "siret", length = 20)
    private String siret;

    @Column(name = "numero_agrement", length = 50)
    private String numeroAgrement;

    @Column(name = "conditions_paiement", length = 100)
    private String conditionsPaiement;

    @Column(name = "delai_livraison")
    private Integer delaiLivraison;

    @Column(name = "note", precision = 3, scale = 2)
    private BigDecimal note;

    @Column(name = "actif")
    private Boolean actif = true;

    // Navigation : un fournisseur peut avoir plusieurs lots
    @OneToMany(mappedBy = "fournisseur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LotMedicament> lots = new ArrayList<>();

    // Navigation : un fournisseur peut avoir plusieurs commandes
    @OneToMany(mappedBy = "fournisseur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<CommandeFournisseur> commandes = new ArrayList<>();
}