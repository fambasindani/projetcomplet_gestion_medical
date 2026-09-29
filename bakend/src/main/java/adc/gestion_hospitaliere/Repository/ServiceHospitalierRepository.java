package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.ServiceHospitalier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceHospitalierRepository extends JpaRepository<ServiceHospitalier, Integer> {
    boolean existsByNomIgnoreCase(String nom);

    @Query("SELECT s FROM ServiceHospitalier s WHERE " +
            "(:actif IS NULL OR s.actif = :actif) AND " +
            "(:term IS NULL OR LOWER(s.nom) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(s.pole) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<ServiceHospitalier> search(@Param("actif") Boolean actif,
                                    @Param("term") String term,
                                    Pageable pageable);
}