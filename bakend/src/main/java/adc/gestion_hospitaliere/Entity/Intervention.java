package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutIntervention;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "interventions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Intervention {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_intervention")
    private Integer idIntervention;

    @Column(name = "numero_intervention", nullable = false, unique = true, length = 20)
    private String numeroIntervention;

    @Column(name = "id_hospitalisation")
    private Integer idHospitalisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hospitalisation", insertable = false, updatable = false)
    private Hospitalisation hospitalisation;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_medecin_principal", nullable = false)
    private Integer idMedecinPrincipal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin_principal", insertable = false, updatable = false)
    private Medecin medecinPrincipal;

    @Column(name = "type_intervention", nullable = false, length = 200)
    private String typeIntervention;

    @Column(name = "description_preop", columnDefinition = "NVARCHAR(MAX)")
    private String descriptionPreop;

    @Column(name = "date_intervention", nullable = false)
    private LocalDateTime dateIntervention;

    @Column(name = "duree_prevue")
    private Integer dureePrevue;

    @Column(name = "duree_reelle")
    private Integer dureeReelle;

    @Column(name = "salle_operation", length = 20)
    private String salleOperation;

    @Column(name = "anesthesie_type", length = 100)
    private String anesthesieType;

    @Column(name = "id_anesthesiste")
    private Integer idAnesthesiste;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_anesthesiste", insertable = false, updatable = false)
    private Medecin anesthesiste;

    @Column(name = "compte_rendu_operatoire", columnDefinition = "NVARCHAR(MAX)")
    private String compteRenduOperatoire;

    @Column(name = "complications", columnDefinition = "NVARCHAR(MAX)")
    private String complications;

    @Column(name = "resultat", columnDefinition = "NVARCHAR(MAX)")
    private String resultat;

    @Column(name = "suites_operatoires", columnDefinition = "NVARCHAR(MAX)")
    private String suitesOperatoires;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutIntervention statut = StatutIntervention.Programmee;

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "motif_annulation", length = 255)
    private String motifAnnulation;

    @Column(name = "consentement_signe")
    private Boolean consentementSigne = false;

    @Column(name = "jeun_respecte")
    private Boolean jeunRespecte = false;

    @Column(name = "notes_infirmieres", columnDefinition = "NVARCHAR(MAX)")
    private String notesInfirmieres;

    // Navigation : une intervention peut avoir plusieurs membres dans l'équipe
    @OneToMany(mappedBy = "intervention", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EquipeIntervention> equipes = new ArrayList<>();
}