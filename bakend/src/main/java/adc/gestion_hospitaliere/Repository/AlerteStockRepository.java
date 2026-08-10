package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.AlerteStock;
import adc.gestion_hospitaliere.Enums.TypeAlerteStock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface AlerteStockRepository extends JpaRepository<AlerteStock, Integer> {

    List<AlerteStock> findByTraiteeFalse();
    List<AlerteStock> findByIdMedicament(Integer idMedicament);
    Page<AlerteStock> findByTypeAlerte(TypeAlerteStock type, Pageable pageable);
    Page<AlerteStock> findByTraitee(boolean traitee, Pageable pageable);

    // ✅ Signature corrigée avec LocalDateTime
    // AlerteStockRepository.java

    @Query("SELECT a FROM AlerteStock a WHERE " +
            "(:type IS NULL OR a.typeAlerte = :type) AND " +
            "(:traitee IS NULL OR a.traitee = :traitee) AND " +
            "(:idMedicament IS NULL OR a.idMedicament = :idMedicament) AND " +
            "(:start IS NULL OR a.dateAlerte >= :start) AND " +
            "(:end IS NULL OR a.dateAlerte <= :end)")
    Page<AlerteStock> search(@Param("type") TypeAlerteStock type,
                             @Param("traitee") Boolean traitee,
                             @Param("idMedicament") Integer idMedicament,
                             @Param("start") LocalDateTime start,
                             @Param("end") LocalDateTime end,
                             Pageable pageable);
}