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
