package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "details_commandes_fournisseurs")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailsCommandeFournisseur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detail_commande")
    private Integer idDetailCommande;

    @Column(name = "id_commande", nullable = false)
    private Integer idCommande;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_commande", insertable = false, updatable = false)
    private CommandeFournisseur commande;

    @Column(name = "id_medicament", nullable = false)
    private Integer idMedicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicament", insertable = false, updatable = false)
    private Medicament medicament;

    @Column(name = "quantite_commandee", nullable = false)
    private Integer quantiteCommandee;

    @Column(name = "quantite_recue")
    private Integer quantiteRecue;

    @Column(name = "prix_unitaire", precision = 10, scale = 3)
    private BigDecimal prixUnitaire;

    @Column(name = "remise", precision = 5, scale = 2)
    private BigDecimal remise;

    @Column(name = "total_ligne", precision = 10, scale = 2)
    private BigDecimal totalLigne;
}