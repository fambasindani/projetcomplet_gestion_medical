package adc.gestion_hospitaliere.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "services")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceHospitalier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_service")
    private Integer idService;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "pole", length = 100)
    private String pole;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "responsable", length = 150)
    private String responsable;

    @Column(name = "actif")
    private Boolean actif = true;

    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @PrePersist
    void prePersist() {
        if (dateCreation == null) dateCreation = LocalDateTime.now();
        if (actif == null) actif = true;
    }
}