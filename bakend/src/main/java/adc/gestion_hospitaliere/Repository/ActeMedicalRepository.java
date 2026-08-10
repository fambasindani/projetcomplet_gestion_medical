package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.ActeMedical;
import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ActeMedicalRepository extends JpaRepository<ActeMedical, Integer> {
    boolean existsByCodeActe(String codeActe);
    boolean existsByCodeActeAndIdActeNot(String codeActe, Integer id);
    Page<ActeMedical> findByActifTrue(Pageable pageable);

    @Query("SELECT a FROM ActeMedical a WHERE " +
            "(:recherche IS NULL OR LOWER(a.codeActe) LIKE LOWER(CONCAT('%', :recherche, '%')) OR " +
            "LOWER(a.libelle) LIKE LOWER(CONCAT('%', :recherche, '%'))) AND " +
            "(:categorie IS NULL OR a.categorie = :categorie) AND " +
            "(:actif IS NULL OR a.actif = :actif)")
    Page<ActeMedical> search(@Param("recherche") String recherche,
                             @Param("categorie") CategorieActeMedical categorie,
                             @Param("actif") Boolean actif,
                             Pageable pageable);
}
