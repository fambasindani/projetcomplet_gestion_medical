package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "details_delivrance")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailDelivrance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detail_delivrance")
    private Integer idDetailDelivrance;

    @Column(name = "id_delivrance", nullable = false)
    private Integer idDelivrance;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_delivrance", insertable = false, updatable = false)
    private DelivranceMedicament delivrance;

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

    @Column(name = "quantite_delivree", nullable = false)
    private Integer quantiteDelivree;

    @Column(name = "prix_unitaire", precision = 10, scale = 3)
    private BigDecimal prixUnitaire;

    @Column(name = "montant_ligne", precision = 10, scale = 2)
    private BigDecimal montantLigne;

    @Column(name = "prise_en_charge_mutuelle", precision = 10, scale = 2)
    private BigDecimal priseEnChargeMutuelle;

    @Column(name = "reste_a_charge", precision = 10, scale = 2)
    private BigDecimal resteACharge;
}