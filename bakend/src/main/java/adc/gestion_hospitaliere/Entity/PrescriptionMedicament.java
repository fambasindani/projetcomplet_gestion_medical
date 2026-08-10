package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions_medicaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PrescriptionMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prescription_med")
    private Integer idPrescriptionMed;

    @Column(name = "id_prescription", nullable = false)
    private Integer idPrescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prescription", insertable = false, updatable = false)
    private Prescription prescription;

    @Column(name = "id_medicament", nullable = false)
    private Integer idMedicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicament", insertable = false, updatable = false)
    private Medicament medicament;

    @Column(name = "id_lot")
    private Integer idLot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lot", insertable = false, updatable = false)
    private LotMedicament lot;

    @Column(name = "posologie", nullable = false, length = 200)
    private String posologie;

    @Column(name = "duree_traitement", length = 100)
    private String dureeTraitement;

    @Column(name = "quantite_prescrite", nullable = false)
    private Integer quantitePrescrite;

    @Column(name = "quantite_delivree")
    private Integer quantiteDelivree;

    @Column(name = "instructions", columnDefinition = "NVARCHAR(MAX)")
    private String instructions;

    @Column(name = "renouvelable")
    private Boolean renouvelable;

    @Column(name = "nombre_renouvellements")
    private Integer nombreRenouvellements;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    // Relation inverse : une prescription de médicament peut avoir plusieurs délivrances
    @OneToMany(mappedBy = "prescriptionMedicament", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DelivranceMedicament> delivrances = new ArrayList<>();
}