package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.EvolutionConsultation;
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
@Table(name = "consultations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Consultation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_consultation")
    private Integer idConsultation;

    @Column(name = "id_rdv")
    private Integer idRdv;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_rdv", insertable = false, updatable = false)
    private RendezVous rendezVous;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_medecin", nullable = false)
    private Integer idMedecin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin", insertable = false, updatable = false)
    private Medecin medecin;

    @Column(name = "date_consultation", nullable = false)
    private LocalDateTime dateConsultation;

    @Column(name = "motif_consultation", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String motifConsultation;

    @Column(name = "histoire_maladie", columnDefinition = "NVARCHAR(MAX)")
    private String histoireMaladie;

    @Column(name = "diagnostic", columnDefinition = "NVARCHAR(MAX)")
    private String diagnostic;

    @Column(name = "traitement_prescris", columnDefinition = "NVARCHAR(MAX)")
    private String traitementPrescris;

    @Column(name = "observations", columnDefinition = "NVARCHAR(MAX)")
    private String observations;

    // Constantes
    @Column(name = "constantes_temperature", precision = 4, scale = 2)
    private BigDecimal temperature;

    @Column(name = "constantes_pouls")
    private Integer pouls;

    @Column(name = "constantes_pression_systolique")
    private Integer pressionSystolique;

    @Column(name = "constantes_pression_diastolique")
    private Integer pressionDiastolique;

    @Column(name = "constantes_saturation")
    private Integer saturation;

    @Column(name = "constantes_glycemie", precision = 5, scale = 2)
    private BigDecimal glycemie;

    @Column(name = "constantes_poids", precision = 5, scale = 2)
    private BigDecimal poids;

    @Column(name = "constantes_taille", precision = 3, scale = 2)
    private BigDecimal taille;

    @Column(name = "constantes_imc", precision = 4, scale = 2)
    private BigDecimal imc;

    @Column(name = "certificat_medical", columnDefinition = "NVARCHAR(MAX)")
    private String certificatMedical;

    @Column(name = "arret_travail_debut")
    private LocalDateTime arretTravailDebut;

    @Column(name = "arret_travail_fin")
    private LocalDateTime arretTravailFin;

    @Enumerated(EnumType.STRING)
    @Column(name = "evolution")
    private EvolutionConsultation evolution;

    @Column(name = "prochain_rdv")
    private LocalDateTime prochainRdv;

    @Column(name = "notes_confidentielles", columnDefinition = "NVARCHAR(MAX)")
    private String notesConfidentielles;

    // Navigation : une consultation peut avoir plusieurs prescriptions
    @OneToMany(mappedBy = "consultation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Prescription> prescriptions = new ArrayList<>();
}