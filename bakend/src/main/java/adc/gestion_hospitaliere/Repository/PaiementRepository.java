package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, Integer> {
    List<Paiement> findByFactureIdFacture(Integer idFacture);

    long countByFactureIdFacture(Integer idFacture);
}
