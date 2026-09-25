package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.Disponibilite;
import adc.gestion_hospitaliere.Enums.Genre;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "medecins")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Medecin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_medecin")
    private Integer idMedecin;

    @Column(name = "matricule", nullable = false, length = 20)
    private String matricule;

    @Column(name = "nom", nullable = false, length = 50)
    private String nom;

    @Column(name = "prenom", length = 50)
    private String prenom;

    @Column(name = "date_naissance")
    private LocalDateTime dateNaissance;

    @Column(name = "lieu_naissance", length = 100)
    private String lieuNaissance;

    @Enumerated(EnumType.STRING)
    @Column(name = "genre", nullable = false)
    private Genre genre;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "id_specialite")
    private Integer idSpecialite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_specialite", insertable = false, updatable = false)
    private Specialite specialite;

    @Column(name = "qualification", length = 100)
    private String qualification;

    @Column(name = "diplome", length = 200)
    private String diplome;

    @Column(name = "numero_ordre", length = 50)
    private String numeroOrdre;

    @Column(name = "date_embauche")
    private LocalDateTime dateEmbauche;

    @Column(name = "salaire")
    private Double salaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "disponibilite", nullable = false)
    private Disponibilite disponibilite = Disponibilite.Disponible;

    @Column(name = "photo", length = 255)
    private String photo;

    @Column(name = "notes")
    private String notes;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @PrePersist
    void prePersist() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
    }

    // Relations (navigation properties – optionnelles pour JPA)
    @OneToMany(mappedBy = "medecin")
    private List<RendezVous> rendezVous = new ArrayList<>();

    @OneToMany(mappedBy = "medecin")
    private List<Consultation> consultations = new ArrayList<>();


}
