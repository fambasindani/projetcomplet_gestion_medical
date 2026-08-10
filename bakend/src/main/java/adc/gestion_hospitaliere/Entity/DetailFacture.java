package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "details_facture")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailFacture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detail")
    private Integer idDetail;

    @Column(name = "id_facture", nullable = false)
    private Integer idFacture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_facture", insertable = false, updatable = false)
    private Facture facture;

    @Column(name = "id_acte")
    private Integer idActe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_acte", insertable = false, updatable = false)
    private ActeMedical acte;

    @Column(name = "id_medicament")
    private Integer idMedicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicament", insertable = false, updatable = false)
    private Medicament medicament;

    @Column(name = "description", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "quantite")
    private Integer quantite = 1;

    @Column(name = "prix_unitaire", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixUnitaire;

    @Column(name = "remise", precision = 5, scale = 2)
    private BigDecimal remise;

    @Column(name = "montant_ht", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantHt;

    @Column(name = "montant_ttc", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTtc;
}