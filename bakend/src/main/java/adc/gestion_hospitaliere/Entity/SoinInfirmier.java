package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "soins_infirmiers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SoinInfirmier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_soin")
    private Integer idSoin;

    @Column(name = "id_hospitalisation", nullable = false)
    private Integer idHospitalisation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_hospitalisation", insertable = false, updatable = false)
    private Hospitalisation hospitalisation;

    @Column(name = "id_infirmier", nullable = false)
    private Integer idInfirmier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_infirmier", insertable = false, updatable = false)
    private Personnel infirmier;

    @Column(name = "date_soin", nullable = false)
    private LocalDateTime dateSoin;

    @Column(name = "type_soin", nullable = false, length = 100)
    private String typeSoin;

    @Column(name = "description", columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @Column(name = "observations", columnDefinition = "NVARCHAR(MAX)")
    private String observations;

    @Column(name = "signature_infirmier")
    private Boolean signatureInfirmier;
}