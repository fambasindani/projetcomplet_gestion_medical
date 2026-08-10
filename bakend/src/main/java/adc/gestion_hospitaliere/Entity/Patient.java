package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.GroupeSanguin;
import adc.gestion_hospitaliere.Enums.SituationFamiliale;
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
@Table(name = "patients")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_patient")
    private Integer idPatient;

    @Column(name = "numero_securite_sociale", nullable = false, unique = true, length = 20)
    private String numeroSecuriteSociale;

    @Column(name = "nom", nullable = false, length = 50)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 50)
    private String prenom;

    @Column(name = "date_naissance", nullable = false)
    private LocalDateTime dateNaissance;

    @Column(name = "lieu_naissance", length = 100)
    private String lieuNaissance;

    @Enumerated(EnumType.STRING)
    @Column(name = "genre", nullable = false)
    private Genre genre;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "telephone_urgent", length = 20)
    private String telephoneUrgent;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "adresse", columnDefinition = "NVARCHAR(MAX)")
    private String adresse;

    @Column(name = "profession", length = 100)
    private String profession;

    @Enumerated(EnumType.STRING)
    @Column(name = "situation_familiale")
    private SituationFamiliale situationFamiliale;

    @Enumerated(EnumType.STRING)
    @Column(name = "groupe_sanguin")
    private GroupeSanguin groupeSanguin;

    @Column(name = "allergies", columnDefinition = "NVARCHAR(MAX)")
    private String allergies;

    @Column(name = "antecedents_medicaux", columnDefinition = "NVARCHAR(MAX)")
    private String antecedentsMedicaux;

    @Column(name = "antecedents_chirurgicaux", columnDefinition = "NVARCHAR(MAX)")
    private String antecedentsChirurgicaux;

    @Column(name = "traitement_habituel", columnDefinition = "NVARCHAR(MAX)")
    private String traitementHabituel;

    @Column(name = "mutuelle", length = 100)
    private String mutuelle;

    @Column(name = "numero_mutuelle", length = 50)
    private String numeroMutuelle;

    @Column(name = "personne_contact_nom", length = 100)
    private String personneContactNom;

    @Column(name = "personne_contact_lien", length = 50)
    private String personneContactLien;

    @Column(name = "personne_contact_telephone", length = 20)
    private String personneContactTelephone;

    @CreationTimestamp
    @Column(name = "date_enregistrement", updatable = false)
    private LocalDateTime dateEnregistrement;

    @Column(name = "consentement")
    private Boolean consentement;

    // Relations (optionnel – à décommenter quand les entités associées existent)
     @OneToMany(mappedBy = "patient")
     private List<RendezVous> rendezVous = new ArrayList<>();
     @OneToMany(mappedBy = "patient")
     private List<Consultation> consultations = new ArrayList<>();
     @OneToMany(mappedBy = "patient")
     private List<Hospitalisation> hospitalisations = new ArrayList<>();
}