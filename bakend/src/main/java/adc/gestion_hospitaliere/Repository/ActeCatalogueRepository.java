package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.ActeCatalogue;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActeCatalogueRepository extends JpaRepository<ActeCatalogue, Integer> {

    List<ActeCatalogue> findByActifTrue();

    List<ActeCatalogue> findAllByOrderByLibelleAsc();

    List<ActeCatalogue> findByIdGroupe(Integer idGroupe);

    boolean existsByCode(String code);

    boolean existsByCodeAndIdActeCatalogueNot(String code, Integer idActeCatalogue);
}
