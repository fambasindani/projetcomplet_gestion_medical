package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.SoinPrescrit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SoinPrescritRepository extends JpaRepository<SoinPrescrit, Integer> {
    List<SoinPrescrit> findByIdPrescription(Integer prescriptionId);
}