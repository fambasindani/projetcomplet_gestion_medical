package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutLot;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lots_medicaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LotMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_lot")
    private Integer idLot;

    @Column(name = "id_medicament", nullable = false)
    private Integer idMedicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicament", insertable = false, updatable = false)
    private Medicament medicament;

    @Column(name = "numero_lot", nullable = false, length = 50)
    private String numeroLot;

    @Column(name = "id_fournisseur")
    private Integer idFournisseur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_fournisseur", insertable = false, updatable = false)
    private FournisseurPharma fournisseur;

    @Column(name = "date_fabrication")
    private LocalDateTime dateFabrication;

    @Column(name = "date_peremption", nullable = false)
    private LocalDateTime datePeremption;

    @Column(name = "quantite_initial", nullable = false)
    private Integer quantiteInitial;

    @Column(name = "quantite_restante", nullable = false)
    private Integer quantiteRestante;

    @Column(name = "prix_achat_unitaire", precision = 10, scale = 3)
    private BigDecimal prixAchatUnitaire;

    @Column(name = "prix_vente_unitaire", precision = 10, scale = 3)
    private BigDecimal prixVenteUnitaire;

    @Column(name = "emplacement_stockage", length = 50)
    private String emplacementStockage;

    @Column(name = "date_reception")
    private LocalDateTime dateReception;

    @Column(name = "bon_commande", length = 50)
    private String bonCommande;

    @Column(name = "facture_fournisseur", length = 50)
    private String factureFournisseur;

    @Column(name = "controle_qualite")
    private Boolean controleQualite = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutLot statut = StatutLot.Disponible;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    // ----- Relations enfants -----
    @OneToMany(mappedBy = "lot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrescriptionMedicament> prescriptions = new ArrayList<>();

    @OneToMany(mappedBy = "lot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailDelivrance> detailsDelivrances = new ArrayList<>();

    @OneToMany(mappedBy = "lot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LigneInventaire> lignesInventaire = new ArrayList<>();

    @OneToMany(mappedBy = "lot", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RetourMedicament> retours = new ArrayList<>();
}