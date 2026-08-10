package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories_medicaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categorie")
    private Integer idCategorie;

    @Column(name = "nom_categorie", nullable = false, length = 100)
    private String nomCategorie;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "code_categorie", length = 20)
    private String codeCategorie;

    // Relation inverse : une catégorie peut contenir plusieurs médicaments
    @OneToMany(mappedBy = "categorie", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Medicament> medicaments = new ArrayList<>();
}