package adc.gestion_hospitaliere.Entity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "specialites")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Specialite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_specialite")
    private Integer idSpecialite;

    @Column(name = "nom_specialite", nullable = false, length = 100)
    private String nomSpecialite;

    @Column(name = "description")
    private String description;

    @Column(name = "chef_service", length = 100)
    private String chefService;

    @Column(name = "telephone_service", length = 20)
    private String telephoneService;

    @Column(name = "email_service", length = 100)
    private String emailService;

    @Column(name = "date_creation")
    private LocalDateTime dateCreation;

    @Column(name = "actif")
    private Boolean actif = true;

    // Relations
    @OneToMany(mappedBy = "specialite")
    private List<Medecin> medecins = new ArrayList<>();

    @OneToMany(mappedBy = "specialite")
    private List<Chambre> chambres = new ArrayList<>();
}