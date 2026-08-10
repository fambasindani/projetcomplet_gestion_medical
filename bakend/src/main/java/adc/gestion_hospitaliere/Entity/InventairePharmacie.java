package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.StatutInventaire;
import adc.gestion_hospitaliere.Enums.TypeInventaire;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventaires_pharmacie")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventairePharmacie {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_inventaire")
    private Integer idInventaire;

    @Column(name = "date_inventaire", nullable = false)
    private LocalDateTime dateInventaire;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_inventaire", nullable = false)
    private TypeInventaire typeInventaire;

    @Column(name = "realise_par", nullable = false)
    private Integer realisePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "realise_par", insertable = false, updatable = false)
    private Personnel realisateur;

    @Column(name = "valide_par")
    private Integer validePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "valide_par", insertable = false, updatable = false)
    private Personnel validateur;

    @Column(name = "date_validation")
    private LocalDateTime dateValidation;

    @Column(name = "observations", columnDefinition = "NVARCHAR(MAX)")
    private String observations;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutInventaire statut = StatutInventaire.En_cours;

    // Navigation : un inventaire peut avoir plusieurs lignes
    @OneToMany(mappedBy = "inventaire", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<LigneInventaire> lignes = new ArrayList<>();
}