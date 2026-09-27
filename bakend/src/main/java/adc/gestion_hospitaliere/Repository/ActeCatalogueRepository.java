package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.ActeCatalogue;
import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ActeCatalogueRepository extends JpaRepository<ActeCatalogue, Integer> {

    List<ActeCatalogue> findByActifTrue();

    List<ActeCatalogue> findAllByOrderByLibelleAsc();

    List<ActeCatalogue> findByIdGroupe(Integer idGroupe);

    @Query("SELECT a FROM ActeCatalogue a LEFT JOIN a.groupe g WHERE " +
            "(:inclureInactifs = true OR a.actif = true) AND " +
            "(:categorie IS NULL OR g.categorie = :categorie) AND " +
            "(:idGroupe IS NULL OR a.idGroupe = :idGroupe) AND " +
            "(:term IS NULL OR LOWER(a.libelle) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(a.code) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(g.libelle) LIKE LOWER(CONCAT('%', :term, '%')))")
    org.springframework.data.domain.Page<ActeCatalogue> searchPage(
            @Param("inclureInactifs") boolean inclureInactifs,
            @Param("categorie") CategorieActeMedical categorie,
            @Param("idGroupe") Integer idGroupe,
            @Param("term") String term,
            org.springframework.data.domain.Pageable pageable);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdActeCatalogueNot(String code, Integer idActeCatalogue);

    // Premier acte actif d'une catégorie donnée (via son groupe) :
    // remplace l'ancien findIdActeParCategorie basé sur actes_medicaux.
    @Query("SELECT a FROM ActeCatalogue a JOIN a.groupe g " +
            "WHERE a.actif = true AND g.categorie = :categorie " +
            "ORDER BY a.idActeCatalogue ASC")
    List<ActeCatalogue> findByCategorie(@Param("categorie") CategorieActeMedical categorie,
                                        org.springframework.data.domain.Pageable pageable);
}
