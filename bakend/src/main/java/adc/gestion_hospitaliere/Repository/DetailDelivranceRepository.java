package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.DetailDelivrance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DetailDelivranceRepository extends JpaRepository<DetailDelivrance, Integer> {
    List<DetailDelivrance> findByIdDelivrance(Integer idDelivrance);
    void deleteByIdDelivrance(Integer idDelivrance);
}