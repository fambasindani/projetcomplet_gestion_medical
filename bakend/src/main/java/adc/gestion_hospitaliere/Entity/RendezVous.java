package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "rendez_vous")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RendezVous {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rdv")
    private Integer idRdv;

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

    @Column(name = "date_rdv", nullable = false)
    private LocalDateTime dateRdv;

    @Column(name = "motif", length = 200)
    private String motif;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutRendezVous statut;

    @Column(name = "type_consultation", length = 50)
    private String typeConsultation;

    @Column(name = "duree_estimee")
    private Integer dureeEstimee;

    @Column(name = "notes_preliminaires", columnDefinition = "NVARCHAR(MAX)")
    private String notesPreliminaires;

    @Column(name = "date_annulation")
    private LocalDateTime dateAnnulation;

    @Column(name = "motif_annulation", length = 255)
    private String motifAnnulation;

    @Column(name = "rappel_envoye")
    private Boolean rappelEnvoye;

    // Relation One-to-One avec Consultation (si besoin)
    @OneToOne(mappedBy = "rendezVous")
    private Consultation consultation;
}