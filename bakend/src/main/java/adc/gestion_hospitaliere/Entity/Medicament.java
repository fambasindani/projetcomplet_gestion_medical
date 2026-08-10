package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "medicaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medicament")
    private Integer idMedicament;

    @Column(name = "code_cip", nullable = false, unique = true, length = 13)
    private String codeCip;

    @Column(name = "code_cis", length = 20)
    private String codeCis;

    @Column(name = "nom_commercial", nullable = false, length = 200)
    private String nomCommercial;

    @Column(name = "denomination_commune", length = 200)
    private String denominationCommune;

    @Column(name = "forme_pharmaceutique", length = 100)
    private String formePharmaceutique;

    @Column(name = "dosage", length = 100)
    private String dosage;

    @Column(name = "presentation", length = 200)
    private String presentation;

    @Column(name = "voie_administration", length = 100)
    private String voieAdministration;

    @Column(name = "id_categorie")
    private Integer idCategorie;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie", insertable = false, updatable = false)
    private CategorieMedicament categorie;

    @Column(name = "laboratoire", length = 150)
    private String laboratoire;

    @Column(name = "substance_active", columnDefinition = "NVARCHAR(MAX)")
    private String substanceActive;

    @Column(name = "excipients", columnDefinition = "NVARCHAR(MAX)")
    private String excipients;

    @Column(name = "indications", columnDefinition = "NVARCHAR(MAX)")
    private String indications;

    @Column(name = "contre_indications", columnDefinition = "NVARCHAR(MAX)")
    private String contreIndications;

    @Column(name = "effets_secondaires", columnDefinition = "NVARCHAR(MAX)")
    private String effetsSecondaires;

    @Column(name = "precautions_emploi", columnDefinition = "NVARCHAR(MAX)")
    private String precautionsEmploi;

    @Column(name = "conservation_conditions", columnDefinition = "NVARCHAR(MAX)")
    private String conservationConditions;

    @Column(name = "temperature_conservation", length = 50)
    private String temperatureConservation;

    @Column(name = "duree_conservation_mois")
    private Integer dureeConservationMois;

    @Column(name = "prescription_obligatoire")
    private Boolean prescriptionObligatoire = false;

    @Column(name = "liste_psychotrope")
    private Boolean listePsychotrope = false;

    @Column(name = "generique")
    private Boolean generique = false;

    @Column(name = "id_generique_parent")
    private Integer idGeneriqueParent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_generique_parent", insertable = false, updatable = false)
    private Medicament generiqueParent;

    @Column(name = "prix_achat", precision = 10, scale = 3)
    private BigDecimal prixAchat;

    @Column(name = "prix_vente", precision = 10, scale = 3)
    private BigDecimal prixVente;

    @Column(name = "taux_remboursement")
    private Integer tauxRemboursement;

    @Column(name = "stock_minimum")
    private Integer stockMinimum = 10;

    @Column(name = "stock_maximum")
    private Integer stockMaximum = 100;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "date_peremption_alerte")
    private Integer datePeremptionAlerte = 30;

    @Column(name = "actif")
    private Boolean actif = true;

    // ========== Relations enfants ==========
    @OneToMany(mappedBy = "medicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LotMedicament> lots = new ArrayList<>();

    @OneToMany(mappedBy = "generiqueParent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Medicament> generiquesEnfants = new ArrayList<>();

    @OneToMany(mappedBy = "medicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailsCommandeFournisseur> detailsCommandes = new ArrayList<>();

    @OneToMany(mappedBy = "medicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrescriptionMedicament> prescriptions = new ArrayList<>();

    @OneToMany(mappedBy = "medicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailDelivrance> detailsDelivrances = new ArrayList<>();

    @OneToMany(mappedBy = "medicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LigneInventaire> lignesInventaire = new ArrayList<>();

    @OneToMany(mappedBy = "medicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<AlerteStock> alertes = new ArrayList<>();

    @OneToMany(mappedBy = "medicament1", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EquivalentsMedicaments> equivalents1 = new ArrayList<>();

    @OneToMany(mappedBy = "medicament2", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EquivalentsMedicaments> equivalents2 = new ArrayList<>();

    @OneToMany(mappedBy = "medicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailFacture> detailsFacture = new ArrayList<>();
}