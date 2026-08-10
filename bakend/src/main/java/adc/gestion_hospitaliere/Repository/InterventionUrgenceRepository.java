package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.InterventionUrgence;
import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterventionUrgenceRepository extends JpaRepository<InterventionUrgence, Integer> {

    boolean existsByNumeroIntervention(String numeroIntervention);

    Page<InterventionUrgence> findByStatut(StatutInterventionUrgence statut, Pageable pageable);

    Page<InterventionUrgence> findByIdPatient(Integer idPatient, Pageable pageable);

    List<InterventionUrgence> findByIdAdmissionUrgence(Integer idAdmissionUrgence);

    @Query("SELECT i FROM InterventionUrgence i WHERE " +
            "(:statut IS NULL OR i.statut = :statut) AND " +
            "(:idPatient IS NULL OR i.idPatient = :idPatient) AND " +
            "(:idMedecin IS NULL OR i.idMedecinPrincipal = :idMedecin) AND " +
            "(:dateStart IS NULL OR i.dateIntervention >= :dateStart) AND " +
            "(:dateEnd IS NULL OR i.dateIntervention <= :dateEnd)")
    Page<InterventionUrgence> search(@Param("statut") StatutInterventionUrgence statut,
                                     @Param("idPatient") Integer idPatient,
                                     @Param("idMedecin") Integer idMedecin,
                                     @Param("dateStart") LocalDateTime dateStart,
                                     @Param("dateEnd") LocalDateTime dateEnd,
                                     Pageable pageable);
}
