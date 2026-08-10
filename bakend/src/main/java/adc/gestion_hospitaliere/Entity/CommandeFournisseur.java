package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutCommandeFournisseur;
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
@Table(name = "commandes_fournisseurs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommandeFournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_commande")
    private Integer idCommande;

    @Column(name = "numero_commande", nullable = false, unique = true, length = 50)
    private String numeroCommande;

    @Column(name = "id_fournisseur", nullable = false)
    private Integer idFournisseur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_fournisseur", insertable = false, updatable = false)
    private FournisseurPharma fournisseur;

    @CreationTimestamp
    @Column(name = "date_commande", updatable = false)
    private LocalDateTime dateCommande;

    @Column(name = "date_livraison_prevue")
    private LocalDateTime dateLivraisonPrevue;

    @Column(name = "date_livraison_reelle")
    private LocalDateTime dateLivraisonReelle;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutCommandeFournisseur statut = StatutCommandeFournisseur.En_attente;

    @Column(name = "montant_total", precision = 10, scale = 2)
    private BigDecimal montantTotal;

    @Column(name = "mode_paiement", length = 50)
    private String modePaiement;

    @Column(name = "paiement_effectue")
    private Boolean paiementEffectue = false;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @Column(name = "commande_par")
    private Integer commandePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "commande_par", insertable = false, updatable = false)
    private Personnel commandeur;

    // Navigation : une commande peut avoir plusieurs lignes de détail
    @OneToMany(mappedBy = "commande", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailsCommandeFournisseur> details = new ArrayList<>();
}