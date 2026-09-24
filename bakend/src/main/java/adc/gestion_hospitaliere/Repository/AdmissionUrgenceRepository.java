package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.AdmissionUrgence;
import adc.gestion_hospitaliere.Enums.GraviteUrgence;
import adc.gestion_hospitaliere.Enums.StatutAdmissionUrgence;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AdmissionUrgenceRepository extends JpaRepository<AdmissionUrgence, Integer> {

    boolean existsByNumeroAdmission(String numeroAdmission);

    Page<AdmissionUrgence> findByStatut(StatutAdmissionUrgence statut, Pageable pageable);

    Page<AdmissionUrgence> findByIdPatient(Integer idPatient, Pageable pageable);

    @Query("SELECT a FROM AdmissionUrgence a WHERE a.statut = :statut ORDER BY " +
            "CASE a.gravite WHEN 'Critique' THEN 0 WHEN 'Urgente' THEN 1 " +
            "WHEN 'Semi_urgente' THEN 2 ELSE 3 END ASC, a.dateArrivee ASC")
    List<AdmissionUrgence> findSalleAttente(@Param("statut") StatutAdmissionUrgence statut);

    @Query("SELECT a FROM AdmissionUrgence a WHERE " +
            "(:statut IS NULL OR a.statut = :statut) AND " +
            "(:gravite IS NULL OR a.gravite = :gravite) AND " +
            "(:idPatient IS NULL OR a.idPatient = :idPatient) AND " +
            "(:idMedecin IS NULL OR a.idMedecin = :idMedecin) AND " +
            "(:dateStart IS NULL OR a.dateArrivee >= :dateStart) AND " +
            "(:dateEnd IS NULL OR a.dateArrivee <= :dateEnd)")
    Page<AdmissionUrgence> search(@Param("statut") StatutAdmissionUrgence statut,
                                  @Param("gravite") GraviteUrgence gravite,
                                  @Param("idPatient") Integer idPatient,
                                  @Param("idMedecin") Integer idMedecin,
                                  @Param("dateStart") LocalDateTime dateStart,
                                  @Param("dateEnd") LocalDateTime dateEnd,
                                  Pageable pageable);
}
