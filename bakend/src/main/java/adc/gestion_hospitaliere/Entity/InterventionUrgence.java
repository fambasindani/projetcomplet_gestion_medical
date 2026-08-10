package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "interventions_urgences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InterventionUrgence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_intervention_urgence")
    private Integer idInterventionUrgence;

    @Column(name = "numero_intervention", nullable = false, unique = true, length = 20)
    private String numeroIntervention;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_admission_urgence")
    private Integer idAdmissionUrgence;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_admission_urgence", insertable = false, updatable = false)
    private AdmissionUrgence admissionUrgence;

    @Column(name = "id_medecin_principal", nullable = false)
    private Integer idMedecinPrincipal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin_principal", insertable = false, updatable = false)
    private Medecin medecinPrincipal;

    @Column(name = "type_intervention", nullable = false, length = 200)
    private String typeIntervention;

    @Column(name = "date_intervention", nullable = false)
    private LocalDateTime dateIntervention;

    @Column(name = "lieu", length = 100)
    private String lieu;

    @Column(name = "duree_prevue")
    private Integer dureePrevue;

    @Column(name = "actes_realises", columnDefinition = "NVARCHAR(MAX)")
    private String actesRealises;

    @Column(name = "materiel_utilise", columnDefinition = "NVARCHAR(MAX)")
    private String materielUtilise;

    @Column(name = "complications", columnDefinition = "NVARCHAR(MAX)")
    private String complications;

    @Column(name = "resultat", columnDefinition = "NVARCHAR(MAX)")
    private String resultat;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutInterventionUrgence statut = StatutInterventionUrgence.Planifiee;

    @Column(name = "notes", columnDefinition = "NVARCHAR(MAX)")
    private String notes;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
}
