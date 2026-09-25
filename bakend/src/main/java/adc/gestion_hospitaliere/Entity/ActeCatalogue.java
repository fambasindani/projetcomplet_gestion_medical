package adc.gestion_hospitaliere.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "actes_catalogue")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActeCatalogue {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acte_catalogue")
    private Integer idActeCatalogue;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "libelle", nullable = false, length = 200)
    private String libelle;

    @Column(name = "id_groupe")
    private Integer idGroupe;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_groupe", insertable = false, updatable = false)
    private GroupeActe groupe;

    @Column(name = "prix_defaut", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixDefaut = BigDecimal.ZERO;

    // Cotation (France : lettre clé + coefficient NGAP/CCAM ; Belgique : nomenclature INAMI)
    @Column(name = "coefficient", precision = 10, scale = 2)
    private BigDecimal coefficient;

    @Column(name = "lettre_cle", length = 20)
    private String lettreCle;

    @Column(name = "remboursable")
    private Boolean remboursable = true;

    @Column(name = "taux_remboursement", precision = 5, scale = 2)
    private BigDecimal tauxRemboursement;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "actif")
    private Boolean actif = true;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @PrePersist
    void prePersist() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
        if (actif == null) actif = true;
        if (prixDefaut == null) prixDefaut = BigDecimal.ZERO;
    }
}
