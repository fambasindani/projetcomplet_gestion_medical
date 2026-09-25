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

    @Query("SELECT COUNT(c) FROM Consultation c WHERE " +
            "(:start IS NULL OR c.dateConsultation >= :start) AND " +
            "(:end IS NULL OR c.dateConsultation <= :end)")
    long countPeriode(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(DISTINCT c.idMedecin) FROM Consultation c WHERE " +
            "(:start IS NULL OR c.dateConsultation >= :start) AND " +
            "(:end IS NULL OR c.dateConsultation <= :end)")
    long countDistinctMedecinsPeriode(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Granularité : jour
    @Query("SELECT FUNCTION('FORMAT', c.dateConsultation, 'yyyy-MM-dd') as periode, COUNT(c) FROM Consultation c " +
            "WHERE (:start IS NULL OR c.dateConsultation >= :start) " +
            "AND (:end IS NULL OR c.dateConsultation <= :end) " +
            "GROUP BY FUNCTION('FORMAT', c.dateConsultation, 'yyyy-MM-dd') " +
            "ORDER BY FUNCTION('FORMAT', c.dateConsultation, 'yyyy-MM-dd') ASC")
    List<Object[]> countParJour(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Granularité : mois
    @Query("SELECT FUNCTION('FORMAT', c.dateConsultation, 'yyyy-MM') as periode, COUNT(c) FROM Consultation c " +
            "WHERE (:start IS NULL OR c.dateConsultation >= :start) " +
            "AND (:end IS NULL OR c.dateConsultation <= :end) " +
            "GROUP BY FUNCTION('FORMAT', c.dateConsultation, 'yyyy-MM') " +
            "ORDER BY FUNCTION('FORMAT', c.dateConsultation, 'yyyy-MM') ASC")
    List<Object[]> countParMoisGran(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Granularité : année
    @Query("SELECT FUNCTION('FORMAT', c.dateConsultation, 'yyyy') as periode, COUNT(c) FROM Consultation c " +
            "WHERE (:start IS NULL OR c.dateConsultation >= :start) " +
            "AND (:end IS NULL OR c.dateConsultation <= :end) " +
            "GROUP BY FUNCTION('FORMAT', c.dateConsultation, 'yyyy') " +
            "ORDER BY FUNCTION('FORMAT', c.dateConsultation, 'yyyy') ASC")
    List<Object[]> countParAnnee(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}