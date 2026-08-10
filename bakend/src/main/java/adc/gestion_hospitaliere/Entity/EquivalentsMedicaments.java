package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.TypeEquivalence;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "equivalents_medicaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquivalentsMedicaments {

    @EmbeddedId
    private EquivalentsMedicamentsId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idMedicament1")
    @JoinColumn(name = "id_medicament_1")
    private Medicament medicament1;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("idMedicament2")
    @JoinColumn(name = "id_medicament_2")
    private Medicament medicament2;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_equivalence", nullable = false)
    private TypeEquivalence typeEquivalence;

    @Column(name = "niveau_preference")
    private Integer niveauPreference;
}