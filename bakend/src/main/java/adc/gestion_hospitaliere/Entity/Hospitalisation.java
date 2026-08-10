package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.ModeEntreeHospitalisation;
import adc.gestion_hospitaliere.Enums.ModeSortieHospitalisation;
import adc.gestion_hospitaliere.Enums.StatutHospitalisation;
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
@Table(name = "hospitalisations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Hospitalisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_hospitalisation")
    private Integer idHospitalisation;

    @Column(name = "numero_admission", nullable = false, unique = true, length = 20)
    private String numeroAdmission;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_chambre")
    private Integer idChambre;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_chambre", insertable = false, updatable = false)
    private Chambre chambre;

    @Column(name = "id_medecin_responsable", nullable = false)
    private Integer idMedecinResponsable;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin_responsable", insertable = false, updatable = false)
    private Medecin medecinResponsable;

    @Column(name = "date_admission", nullable = false)
    private LocalDateTime dateAdmission;

    @Column(name = "date_sortie")
    private LocalDateTime dateSortie;

    @Column(name = "motif_admission", nullable = false, columnDefinition = "NVARCHAR(MAX)")
    private String motifAdmission;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_entree", nullable = false)
    private ModeEntreeHospitalisation modeEntree;

    @Column(name = "provenance", length = 100)
    private String provenance;

    @Column(name = "diagnostic_principal", columnDefinition = "NVARCHAR(MAX)")
    private String diagnosticPrincipal;

    @Column(name = "traitements_en_cours", columnDefinition = "NVARCHAR(MAX)")
    private String traitementsEnCours;

    @Column(name = "examens_realises", columnDefinition = "NVARCHAR(MAX)")
    private String examensRealises;

    @Column(name = "regime_alimentaire", length = 100)
    private String regimeAlimentaire;

    @Column(name = "consignes_particulieres", columnDefinition = "NVARCHAR(MAX)")
    private String consignesParticulieres;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutHospitalisation statut = StatutHospitalisation.En_cours;

    @Column(name = "notes_sortie", columnDefinition = "NVARCHAR(MAX)")
    private String notesSortie;

    @Enumerated(EnumType.STRING)
    @Column(name = "mode_sortie")
    private ModeSortieHospitalisation modeSortie;

    @Column(name = "destination_sortie", length = 100)
    private String destinationSortie;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;

    // Relations enfants
    @OneToMany(mappedBy = "hospitalisation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SoinInfirmier> soins = new ArrayList<>();

    @OneToMany(mappedBy = "hospitalisation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ConstanteHospitalisation> constantes = new ArrayList<>();

    @OneToMany(mappedBy = "hospitalisation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Intervention> interventions = new ArrayList<>();

    @OneToMany(mappedBy = "hospitalisation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Prescription> prescriptions = new ArrayList<>();

    @OneToMany(mappedBy = "hospitalisation", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Facture> factures = new ArrayList<>();
}