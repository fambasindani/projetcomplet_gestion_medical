package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutPrescription;
import adc.gestion_hospitaliere.Enums.TypePrescription;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "prescriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_prescription")
    private Integer idPrescription;

    @Column(name = "numero_prescription", nullable = false, unique = true, length = 20)
    private String numeroPrescription;

    @Column(name = "id_consultation")
    private Integer idConsultation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_consultation", insertable = false, updatable = false)
    private Consultation consultation;

    @Column(name = "id_hospitalisation")
    private Integer idHospitalisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hospitalisation", insertable = false, updatable = false)
    private Hospitalisation hospitalisation;

    @Column(name = "id_medecin", nullable = false)
    private Integer idMedecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin", insertable = false, updatable = false)
    private Medecin medecin;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "date_prescription", nullable = false)
    private LocalDateTime datePrescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_prescription", nullable = false)
    private TypePrescription typePrescription;

    @Column(name = "description", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "instructions", columnDefinition = "NVARCHAR(MAX)")
    private String instructions;

    @Column(name = "urgente")
    private Boolean urgente = false;

    @Column(name = "date_debut")
    private LocalDateTime dateDebut;

    @Column(name = "date_fin")
    private LocalDateTime dateFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutPrescription statut = StatutPrescription.Active;

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "motif_annulation", length = 255)
    private String motifAnnulation;

    @Column(name = "notes_complementaires", columnDefinition = "NVARCHAR(MAX)")
    private String notesComplementaires;

    // Relations enfants
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<PrescriptionMedicament> prescriptionsMedicaments = new ArrayList<>();

    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Examen> examens = new ArrayList<>();
}