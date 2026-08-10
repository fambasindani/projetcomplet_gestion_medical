package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "lignes_inventaire")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LigneInventaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_ligne_inventaire")
    private Integer idLigneInventaire;

    @Column(name = "id_inventaire", nullable = false)
    private Integer idInventaire;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_inventaire", insertable = false, updatable = false)
    private InventairePharmacie inventaire;

    @Column(name = "id_medicament", nullable = false)
    private Integer idMedicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicament", insertable = false, updatable = false)
    private Medicament medicament;

    @Column(name = "id_lot", nullable = false)
    private Integer idLot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lot", insertable = false, updatable = false)
    private LotMedicament lot;

    @Column(name = "quantite_theorique", nullable = false)
    private Integer quantiteTheorique;

    @Column(name = "quantite_reelle", nullable = false)
    private Integer quantiteReelle;

    @Column(name = "ecart")
    private Integer ecart;

    @Column(name = "raison_ecart", length = 255)
    private String raisonEcart;

    @Column(name = "prix_unitaire", precision = 10, scale = 3)
    private BigDecimal prixUnitaire;

    @Column(name = "valeur_ecart", precision = 10, scale = 2)
    private BigDecimal valeurEcart;
}