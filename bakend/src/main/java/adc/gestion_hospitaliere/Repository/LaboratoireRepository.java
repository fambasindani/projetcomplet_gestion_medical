package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Laboratoire;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LaboratoireRepository extends JpaRepository<Laboratoire, Integer> {
    List<Laboratoire> findByActifTrueOrderByNomAsc();
    boolean existsByNomIgnoreCase(String nom);

    @Query("SELECT l FROM Laboratoire l WHERE " +
            "(:actif IS NULL OR l.actif = :actif) AND " +
            "(:term IS NULL OR LOWER(l.nom) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(l.type) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<Laboratoire> search(@Param("actif") Boolean actif,
                             @Param("term") String term,
                             Pageable pageable);
}