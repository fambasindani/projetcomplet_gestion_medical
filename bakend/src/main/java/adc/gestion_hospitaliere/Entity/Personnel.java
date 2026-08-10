package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.TypeContrat;
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
@Table(name = "personnel")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Personnel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_personnel")
    private Integer idPersonnel;

    @Column(name = "matricule", nullable = false, unique = true, length = 20)
    private String matricule;

    @Column(name = "nom", nullable = false, length = 50)
    private String nom;

    @Column(name = "prenom", nullable = false, length = 50)
    private String prenom;

    @Column(name = "date_naissance")
    private LocalDateTime dateNaissance;

    @Enumerated(EnumType.STRING)
    @Column(name = "genre", nullable = false)
    private Genre genre;

    @Column(name = "fonction", nullable = false, length = 100)
    private String fonction;

    @Column(name = "service", length = 100)
    private String service;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "adresse", columnDefinition = "NVARCHAR(MAX)")
    private String adresse;

    @Column(name = "date_embauche")
    private LocalDateTime dateEmbauche;

    @Column(name = "salaire", precision = 10, scale = 2)
    private BigDecimal salaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_contrat")
    private TypeContrat typeContrat;

    @Column(name = "photo", length = 255)
    private String photo;

    // Relations
    // (Note: les entités référencées doivent exister; on commente par défaut si absentes)


    @OneToMany(mappedBy = "commandePar")
    private List<CommandeFournisseur> commandesPassees = new ArrayList<>();

    @OneToMany(mappedBy = "pharmacien")
    private List<DelivranceMedicament> delivrancesEffectuees = new ArrayList<>();

    @OneToMany(mappedBy = "realisePar")
    private List<InventairePharmacie> inventairesRealises = new ArrayList<>();

    @OneToMany(mappedBy = "validePar")
    private List<InventairePharmacie> inventairesValides = new ArrayList<>();

    @OneToMany(mappedBy = "traiteePar")
    private List<AlerteStock> alertesTraitees = new ArrayList<>();

    @OneToMany(mappedBy = "pharmacien")
    private List<RetourMedicament> retoursTraites = new ArrayList<>();


    @OneToMany(mappedBy = "infirmier")
    private List<SoinInfirmier> soins = new ArrayList<>();


    @OneToMany(mappedBy = "encaissePar")
    private List<Paiement> paiementsEncaisses = new ArrayList<>();

}