package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.SoinInfirmier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SoinInfirmierRepository extends JpaRepository<SoinInfirmier, Integer> {
    List<SoinInfirmier> findByIdHospitalisation(Integer hospitalisationId);
    List<SoinInfirmier> findByIdInfirmier(Integer infirmierId);

    @Query("SELECT s FROM SoinInfirmier s WHERE " +
            "(:typeSoin IS NULL OR LOWER(s.typeSoin) LIKE LOWER(CONCAT('%', :typeSoin, '%'))) AND " +
            "(:idHospitalisation IS NULL OR s.idHospitalisation = :idHospitalisation) AND " +
            "(:idInfirmier IS NULL OR s.idInfirmier = :idInfirmier) AND " +
            "(:dateStart IS NULL OR s.dateSoin >= :dateStart) AND " +
            "(:dateEnd IS NULL OR s.dateSoin <= :dateEnd)")
    Page<SoinInfirmier> search(@Param("typeSoin") String typeSoin,
                               @Param("idHospitalisation") Integer idHospitalisation,
                               @Param("idInfirmier") Integer idInfirmier,
                               @Param("dateStart") LocalDateTime dateStart,
                               @Param("dateEnd") LocalDateTime dateEnd,
                               Pageable pageable);
}