package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutFacture;
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
@Table(name = "factures")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Facture {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_facture")
    private Integer idFacture;

    @Column(name = "numero_facture", nullable = false, unique = true, length = 20)
    private String numeroFacture;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_hospitalisation")
    private Integer idHospitalisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hospitalisation", insertable = false, updatable = false)
    private Hospitalisation hospitalisation;

    @Column(name = "date_emission", nullable = false)
    private LocalDateTime dateEmission;

    @Column(name = "date_echeance")
    private LocalDateTime dateEcheance;

    @Column(name = "montant_ht", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantHt;

    @Column(name = "tva", precision = 5, scale = 2)
    private BigDecimal tva;

    @Column(name = "montant_ttc", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTtc;

    @Column(name = "montant_paye", precision = 10, scale = 2)
    private BigDecimal montantPaye;

    @Column(name = "montant_restant", precision = 10, scale = 2)
    private BigDecimal montantRestant;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutFacture statut = StatutFacture.En_attente;

    @Column(name = "mode_paiement", length = 50)
    private String modePaiement;

    @Column(name = "assurance_prise_en_charge")
    private Boolean assurancePriseEnCharge = false;

    @Column(name = "mutuelle_id", length = 50)
    private String mutuelleId;

    @Column(name = "mutuelle_prise_en_charge", precision = 10, scale = 2)
    private BigDecimal mutuellePriseEnCharge;

    @Column(name = "date_paiement_total")
    private LocalDateTime datePaiementTotal;

    @Column(name = "notes_comptables", columnDefinition = "NVARCHAR(MAX)")
    private String notesComptables;

    // Navigation : une facture peut avoir plusieurs lignes de détail
    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailFacture> details = new ArrayList<>();

    // Navigation : une facture peut avoir plusieurs paiements
    @OneToMany(mappedBy = "facture", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Paiement> paiements = new ArrayList<>();
}