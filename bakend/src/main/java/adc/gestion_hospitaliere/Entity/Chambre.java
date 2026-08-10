package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutChambre;
import adc.gestion_hospitaliere.Enums.TypeChambre;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chambres")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Chambre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_chambre")
    private Integer idChambre;

    @Column(name = "numero_chambre", nullable = false, length = 10)
    private String numeroChambre;

    @Column(name = "etage")
    private Integer etage;

    @Column(name = "batiment", length = 50)
    private String batiment;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_chambre", nullable = false)
    private TypeChambre typeChambre;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutChambre statut = StatutChambre.Disponible;

    @Column(name = "prix_jour")
    private Double prixJour;

    @Column(name = "id_specialite")
    private Integer idSpecialite;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_specialite", insertable = false, updatable = false)
    private Specialite specialite;

    @Column(name = "equipements")
    private String equipements;

    @Column(name = "telephone")
    private Boolean telephone = false;

    @Column(name = "television")
    private Boolean television = false;

    @Column(name = "wifi")
    private Boolean wifi = false;

    @Column(name = "salle_bain_privee")
    private Boolean salleBainPrivee = true;

    @Column(name = "accessibilite_handicape")
    private Boolean accessibiliteHandicape = true;

    @Column(name = "notes")
    private String notes;

    // Relations
    @OneToMany(mappedBy = "chambre")
    private List<Hospitalisation> hospitalisations = new ArrayList<>();
}