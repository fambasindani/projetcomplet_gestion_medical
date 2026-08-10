package adc.gestion_hospitaliere.Entity;

import adc.gestion_hospitaliere.Enums.StatutSoin;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "soins_prescrits")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoinPrescrit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_soin")
    private Integer idSoin;

    @Column(name = "id_prescription", nullable = false)
    private Integer idPrescription;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @Column(name = "id_infirmier")
    private Integer idInfirmier;

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "instructions")
    private String instructions;

    @Column(name = "frequence")
    private String frequence;

    @Column(name = "duree")
    private String duree;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutSoin statut = StatutSoin.Prescrit;

    @Column(name = "date_prescription", updatable = false)
    private LocalDateTime datePrescription = LocalDateTime.now();

    // Relations optionnelles
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_prescription", insertable = false, updatable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_infirmier", insertable = false, updatable = false)
    private Personnel infirmier;
}