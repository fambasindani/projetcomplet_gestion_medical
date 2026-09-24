package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.GroupeActe;
import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GroupeActeRepository extends JpaRepository<GroupeActe, Integer> {
    List<GroupeActe> findByCategorieAndActifTrueOrderByLibelle(CategorieActeMedical categorie);

    List<GroupeActe> findAllByOrderByCategorieAscLibelleAsc();

    List<GroupeActe> findByCategorieOrderByLibelle(CategorieActeMedical categorie);

    boolean existsByLibelleAndCategorie(String libelle, CategorieActeMedical categorie);
}
