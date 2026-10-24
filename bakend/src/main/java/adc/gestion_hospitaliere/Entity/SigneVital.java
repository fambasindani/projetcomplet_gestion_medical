package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Signes vitaux / pré-consultation relevés par le personnel soignant
 * (infirmier) avant ou pendant la prise en charge du patient, indépendamment
 * de l'hospitalisation. Conserve un historique tracé (qui, quand, valeurs).
 */
@Entity
@Table(name = "signes_vitaux")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SigneVital {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_signe_vital")
    private Integer idSigneVital;

    @Column(name = "id_patient", nullable = false)
    private Integer idPatient;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_patient", insertable = false, updatable = false)
    private Patient patient;

    @Column(name = "id_personnel")
    private Integer idPersonnel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_personnel", insertable = false, updatable = false)
    private Personnel personnel;

    @Column(name = "date_mesure", nullable = false)
    private LocalDateTime dateMesure;

    @Column(name = "poids", precision = 5, scale = 2)
    private BigDecimal poids;

    @Column(name = "taille", precision = 5, scale = 2)
    private BigDecimal taille;

    @Column(name = "imc", precision = 5, scale = 2)
    private BigDecimal imc;

    @Column(name = "temperature", precision = 4, scale = 2)
    private BigDecimal temperature;

    @Column(name = "pouls")
    private Integer pouls;

    @Column(name = "pression_systolique")
    private Integer pressionSystolique;

    @Column(name = "pression_diastolique")
    private Integer pressionDiastolique;

    @Column(name = "saturation")
    private Integer saturation;

    @Column(name = "frequence_respiratoire")
    private Integer frequenceRespiratoire;

    @Column(name = "glycemie", precision = 5, scale = 2)
    private BigDecimal glycemie;

    @Column(name = "douleur_echelle")
    private Integer douleurEchelle;

    @Column(name = "prise_par", length = 100)
    private String prisePar;

    @Column(name = "observations", columnDefinition = "NVARCHAR(MAX)")
    private String observations;
}
