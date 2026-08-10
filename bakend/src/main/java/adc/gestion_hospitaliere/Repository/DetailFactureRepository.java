package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.DetailFacture;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DetailFactureRepository extends JpaRepository<DetailFacture, Integer> {
    List<DetailFacture> findByFactureIdFacture(Integer idFacture);
    void deleteByFactureIdFacture(Integer idFacture);
    boolean existsByIdActe(Integer idActe);
    boolean existsByIdMedicament(Integer idMedicament);
}
