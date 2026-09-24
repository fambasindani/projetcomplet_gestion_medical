package adc.gestion_hospitaliere.Entity;

import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "groupes_actes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GroupeActe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_groupe")
    private Integer idGroupe;

    @Column(name = "libelle", nullable = false, length = 100)
    private String libelle;

    @Enumerated(EnumType.STRING)
    @Column(name = "categorie", nullable = false, length = 20)
    private CategorieActeMedical categorie;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "actif")
    private Boolean actif = true;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();
}
