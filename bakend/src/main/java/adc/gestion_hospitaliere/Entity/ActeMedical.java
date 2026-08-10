package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "actes_medicaux")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActeMedical {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_acte")
    private Integer idActe;

    @Column(name = "code_acte", nullable = false, unique = true, length = 20)
    private String codeActe;

    @Column(name = "libelle", nullable = false, length = 200)
    private String libelle;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "prix_base", nullable = false, precision = 10, scale = 2)
    private BigDecimal prixBase;

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie", nullable = false, length = 20)
    private CategorieActeMedical categorie;

    @Column(name = "coefficient", precision = 5, scale = 2)
    private BigDecimal coefficient = BigDecimal.ONE;

    @Column(name = "lettre_cle", length = 5)
    private String lettreCle;

    @Column(name = "remboursable")
    private Boolean remboursable = true;

    @Column(name = "taux_remboursement")
    private Integer tauxRemboursement = 70;

    @Column(name = "actif")
    private Boolean actif = true;

    // Navigation : un acte médical peut apparaître dans plusieurs lignes de facture
    @OneToMany(mappedBy = "acte", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DetailFacture> detailsFacture = new ArrayList<>();
}