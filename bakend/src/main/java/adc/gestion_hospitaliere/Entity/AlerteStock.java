package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.TypeAlerteStock;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alertes_stock")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlerteStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_alerte")
    private Integer idAlerte;

    @Column(name = "id_medicament", nullable = false)
    private Integer idMedicament;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_medicament", insertable = false, updatable = false)
    private Medicament medicament;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_alerte", nullable = false)
    private TypeAlerteStock typeAlerte;

    @Column(name = "seuil_actuel")
    private Integer seuilActuel;

    @Column(name = "seuil_minimum")
    private Integer seuilMinimum;

    @Column(name = "date_peremption")
    private LocalDateTime datePeremption;

    @CreationTimestamp
    @Column(name = "date_alerte", updatable = false)
    private LocalDateTime dateAlerte;

    @Column(name = "traitee")
    private Boolean traitee = false;

    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;

    @Column(name = "traitee_par")
    private Integer traiteePar;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "traitee_par", insertable = false, updatable = false)
    private Personnel traiteur;

    @Column(name = "action_entreprise", length = 255)
    private String actionEntreprise;
}