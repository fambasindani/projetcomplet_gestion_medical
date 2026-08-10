package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.ModePaiement;
import adc.gestion_hospitaliere.Enums.StatutPaiement;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_paiement")
    private Integer idPaiement;

    @Column(name = "id_facture", nullable = false)
    private Integer idFacture;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_facture", insertable = false, updatable = false)
    private Facture facture;

    @Column(name = "date_paiement", nullable = false)
    private LocalDateTime datePaiement;

    @Column(name = "montant", nullable = false, precision = 10, scale = 2)
    private BigDecimal montant;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_paiement", nullable = false)
    private ModePaiement modePaiement;

    @Column(name = "reference_paiement", length = 100)
    private String referencePaiement;

    @Column(name = "encaisse_par")
    private Integer encaissePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "encaisse_par", insertable = false, updatable = false)
    private Personnel encaisseur;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutPaiement statut = StatutPaiement.Effectue;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;
}