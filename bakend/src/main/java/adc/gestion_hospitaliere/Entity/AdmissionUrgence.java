package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.GraviteUrgence;
import adc.gestion_hospitaliere.Enums.StatutAdmissionUrgence;
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
@Table(name = "admissions_urgences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdmissionUrgence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_admission_urgence")
    private Integer idAdmissionUrgence;

    @Column(name = "numero_admission", nullable = false, unique = true, length = 20)
    private String numeroAdmission;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_medecin")
    private Integer idMedecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin", insertable = false, updatable = false)
    private Medecin medecin;

    @Column(name = "date_arrivee", nullable = false)
    private LocalDateTime dateArrivee;

    @Column(name = "motif_urgent", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String motifUrgent;

    @Enumerated(EnumType.STRING)
    @Column(name = "gravite", nullable = false)
    private GraviteUrgence gravite = GraviteUrgence.Non_urgente;

    @Column(name = "symptomes", columnDefinition = "NVARCHAR(MAX)")
    private String symptomes;

    @Column(name = "tension_arterielle", length = 20)
    private String tensionArterielle;

    @Column(name = "pouls")
    private Integer pouls;

    @Column(name = "temperature")
    private Double temperature;

    @Column(name = "saturation_oxygene")
    private Integer saturationOxygene;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutAdmissionUrgence statut = StatutAdmissionUrgence.En_attente;

    @Column(name = "date_prise_en_charge")
    private LocalDateTime datePriseEnCharge;

    @Column(name = "orientation", length = 100)
    private String orientation;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    @OneToMany(mappedBy = "admissionUrgence", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InterventionUrgence> interventions = new ArrayList<>();
}
