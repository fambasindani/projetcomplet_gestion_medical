package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.LigneInventaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LigneInventaireRepository extends JpaRepository<LigneInventaire, Integer> {
    List<LigneInventaire> findByIdInventaire(Integer idInventaire);
    void deleteByIdInventaire(Integer idInventaire);
}
