package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.DetailsCommandeFournisseur;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;





@Repository
public interface DetailsCommandeFournisseurRepository extends JpaRepository<DetailsCommandeFournisseur, Integer> {

    @Transactional
    void deleteByIdCommande(Integer idCommande);
}
