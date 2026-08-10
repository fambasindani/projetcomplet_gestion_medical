package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "constantes_hospitalisation")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConstanteHospitalisation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_constante")
    private Integer idConstante;

    @Column(name = "id_hospitalisation", nullable = false)
    private Integer idHospitalisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hospitalisation", insertable = false, updatable = false)
    private Hospitalisation hospitalisation;

    @Column(name = "date_mesure", nullable = false)
    private LocalDateTime dateMesure;

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