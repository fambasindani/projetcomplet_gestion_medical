package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.CategorieExamen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface CategorieExamenRepository extends JpaRepository<CategorieExamen, Integer> {
    Optional<CategorieExamen> findByCode(String code);

    @Query("SELECT c FROM CategorieExamen c WHERE " +
            "(:actif IS NULL OR c.actif = :actif) AND " +
            "(:term IS NULL OR LOWER(c.code) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(c.libelle) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<CategorieExamen> search(@Param("actif") Boolean actif,
                                 @Param("term") String term,
                                 Pageable pageable);
}