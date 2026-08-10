package adc.gestion_hospitaliere.Entity;

import adc.gestion_hospitaliere.Enums.ConfidentialiteExamen;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "examens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Examen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_examen")
    private Integer idExamen;

    @Column(name = "numero_examen", nullable = false, unique = true, length = 20)
    private String numeroExamen;

    // --- Relations et clés étrangères ---

    @Column(name = "id_prescription")
    private Integer idPrescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prescription", insertable = false, updatable = false)
    private Prescription prescription;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_medecin_prescripteur", nullable = false)
    private Integer idMedecinPrescripteur;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medecin_prescripteur", insertable = false, updatable = false)
    private Medecin medecinPrescripteur;

    // --- Nouvelle relation vers CategorieExamen (clé étrangère) ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categorie_examen", nullable = false)
    private CategorieExamen categorie;

    // --- Autres champs ---

    @Column(name = "type_examen", nullable = false, length = 100)
    private String typeExamen;

    @Column(name = "date_prescription", nullable = false)
    private LocalDateTime datePrescription;

    @Column(name = "date_planification")
    private LocalDateTime datePlanification;

    @Column(name = "date_realisation")
    private LocalDateTime dateRealisation;

    @Column(name = "laboratoire", length = 100)
    private String laboratoire;

    @Column(name = "technicien", length = 100)
    private String technicien;

    @Column(name = "resultat", columnDefinition = "NVARCHAR(MAX)")
    private String resultat;

    @Column(name = "interpretation", columnDefinition = "NVARCHAR(MAX)")
    private String interpretation;

    @Column(name = "fichier_joint", length = 255)
    private String fichierJoint;

    @Column(name = "compte_rendu", columnDefinition = "NVARCHAR(MAX)")
    private String compteRendu;

    @Column(name = "anomalies", columnDefinition = "NVARCHAR(MAX)")
    private String anomalies;

    @Column(name = "conclusion", columnDefinition = "NVARCHAR(MAX)")
    private String conclusion;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutExamen statut = StatutExamen.Prescrit;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "valide_par")
    private Integer validePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "valide_par", insertable = false, updatable = false)
    private Medecin validateur;

    @Enumerated(EnumType.STRING)
    @Column(name = "confidentialite", nullable = false)
    private ConfidentialiteExamen confidentialite = ConfidentialiteExamen.Normal;
}