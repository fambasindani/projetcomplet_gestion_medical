package adc.gestion_hospitaliere.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "laboratoires")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Laboratoire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_laboratoire")
    private Integer idLaboratoire;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "type", length = 50)
    private String type;

    @Column(name = "responsable", length = 150)
    private String responsable;

    @Column(name = "accreditation", length = 50)
    private String accreditation;

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