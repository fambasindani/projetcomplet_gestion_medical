package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.Consultation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Integer> {
    Page<Consultation> findByIdPatient(Integer idPatient, Pageable pageable);
    Page<Consultation> findByIdMedecin(Integer idMedecin, Pageable pageable);
    List<Consultation> findByPatient_IdPatient(Integer patientId);

    long countByDateConsultationBetween(LocalDateTime start, LocalDateTime end);

    long countByIdMedecin(Integer idMedecin);

    @Query("SELECT COUNT(DISTINCT c.idMedecin) FROM Consultation c")
    long countDistinctMedecins();

    @Query("SELECT c.medecin, COUNT(c) FROM Consultation c GROUP BY c.medecin ORDER BY COUNT(c) DESC")
    List<Object[]> findTopMedecins(Pageable pageable);

    @Query("SELECT FUNCTION('FORMAT', c.dateConsultation, 'yyyy-MM') as month, COUNT(c) FROM Consultation c WHERE c.dateConsultation >= :start GROUP BY month ORDER BY month ASC")
    List<Object[]> countByMonthSince(@Param("start") LocalDateTime start);
}