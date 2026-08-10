package adc.gestion_hospitaliere.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "categories_examen")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorieExamen {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categorie_examen")
    private Integer idCategorieExamen;

    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "libelle", nullable = false, length = 100)
    private String libelle;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "actif")
    private Boolean actif = true;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @OneToMany(mappedBy = "categorie", fetch = FetchType.LAZY)
    private List<Examen> examens = new ArrayList<>();
}