package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.RendezVous;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface RendezVousRepository extends JpaRepository<RendezVous, Integer> {

    // Méthodes supplémentaires



    List<RendezVous> findByIdMedecinAndDateRdvBetween(Integer idMedecin, LocalDateTime start, LocalDateTime end);
    List<RendezVous> findByDateRdvBetween(LocalDateTime start, LocalDateTime end);
    Page<RendezVous> findByIdPatient(Integer idPatient, Pageable pageable);
   // Page<RendezVous> findByIdMedecin(Integer idMedecin, Pageable pageable);
    Page<RendezVous> findByStatut(StatutRendezVous statut, Pageable pageable);

    @Query("SELECT r FROM RendezVous r WHERE r.dateRdv BETWEEN :start AND :end")
    List<RendezVous> findBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT r FROM RendezVous r WHERE DATE(r.dateRdv) = DATE(:date)")
    List<RendezVous> findByDate(@Param("date") LocalDateTime date);

    boolean existsByIdMedecinAndDateRdvBetween(Integer idMedecin, LocalDateTime start, LocalDateTime end);
    long countByDateRdvBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT r FROM RendezVous r WHERE " +
            "(:statut IS NULL OR r.statut = :statut) AND " +
            "(:start IS NULL OR r.dateRdv >= :start) AND " +
            "(:end IS NULL OR r.dateRdv <= :end) AND " +
            "(:idMedecin IS NULL OR r.idMedecin = :idMedecin) AND " +
            "(:idPatient IS NULL OR r.idPatient = :idPatient)")
    Page<RendezVous> search(@Param("statut") StatutRendezVous statut,
                            @Param("start") LocalDateTime start,
                            @Param("end") LocalDateTime end,
                            @Param("idMedecin") Integer idMedecin,
                            @Param("idPatient") Integer idPatient,
                            Pageable pageable);


    Page<RendezVous> findByIdMedecin(Integer idMedecin, Pageable pageable);

    Page<RendezVous> findByIdMedecinAndDateRdvBetween(Integer idMedecin,
                                                      LocalDateTime start,
                                                      LocalDateTime end,
                                                      Pageable pageable);

    @Query("SELECT r FROM RendezVous r WHERE r.idMedecin = :idMedecin " +
            "AND (:statut IS NULL OR r.statut = :statut)")
    Page<RendezVous> findByIdMedecinAndStatut(@Param("idMedecin") Integer idMedecin,
                                              @Param("statut") StatutRendezVous statut,
                                              Pageable pageable);

    long countByIdMedecinAndDateRdvBetween(Integer idMedecin,
                                           LocalDateTime start,
                                           LocalDateTime end);

    long countByIdMedecin(Integer idMedecin);

    @Query("SELECT r FROM RendezVous r LEFT JOIN FETCH r.patient p " +
            "WHERE r.idMedecin = :idMedecin AND r.dateRdv >= :date AND r.statut <> :annule " +
            "ORDER BY r.dateRdv ASC")
    List<RendezVous> findUpcomingByMedecin(@Param("idMedecin") Integer idMedecin,
                                           @Param("date") LocalDateTime date,
                                           @Param("annule") StatutRendezVous annule);
}