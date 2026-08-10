package adc.gestion_hospitaliere.Entity;
import adc.gestion_hospitaliere.Enums.MotifRetour;
import adc.gestion_hospitaliere.Enums.StatutRetour;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "retours_medicaments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RetourMedicament {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_retour")
    private Integer idRetour;

    @CreationTimestamp
    @Column(name = "date_retour", updatable = false)
    private LocalDateTime dateRetour;

    @Column(name = "id_patient")
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_lot", nullable = false)
    private Integer idLot;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_lot", insertable = false, updatable = false)
    private LotMedicament lot;

    @Column(name = "quantite_retournee", nullable = false)
    private Integer quantiteRetournee;

    @Enumerated(EnumType.STRING)
    @Column(name = "motif_retour", nullable = false)
    private MotifRetour motifRetour;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "id_pharmacien", nullable = false)
    private Integer idPharmacien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_pharmacien", insertable = false, updatable = false)
    private Personnel pharmacien;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutRetour statut = StatutRetour.En_attente;
}