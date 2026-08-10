package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.MotifDelivrance;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "delivrances_medicaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DelivranceMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_delivrance")
    private Integer idDelivrance;

    @Column(name = "numero_ordonnance", length = 50)
    private String numeroOrdonnance;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_medecin_prescripteur")
    private Integer idMedecinPrescripteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin_prescripteur", insertable = false, updatable = false)
    private Medecin medecinPrescripteur;

    @Column(name = "id_prescription_med")
    private Integer idPrescriptionMed;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prescription_med", insertable = false, updatable = false)
    private PrescriptionMedicament prescriptionMedicament;

    @CreationTimestamp
    @Column(name = "date_delivrance", updatable = false)
    private LocalDateTime dateDelivrance;

    @Column(name = "id_pharmacien", nullable = false)
    private Integer idPharmacien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pharmacien", insertable = false, updatable = false)
    private Personnel pharmacien;

    @Enumerated(EnumType.STRING)
    @Column(name = "motif_delivrance", nullable = false)
    private MotifDelivrance motifDelivrance;

    @Column(name = "observations", columnDefinition = "NVARCHAR(MAX)")
    private String observations;

    @Column(name = "signature_electronique")
    private Boolean signatureElectronique = false;

    // Un délivrance peut avoir plusieurs lignes de détail
    @OneToMany(mappedBy = "delivrance", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailDelivrance> details = new ArrayList<>();
}