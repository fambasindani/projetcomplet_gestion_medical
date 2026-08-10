package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.PrescriptionMedicament;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PrescriptionMedicamentRepository extends JpaRepository<PrescriptionMedicament, Integer> {
    List<PrescriptionMedicament> findByIdPrescription(Integer idPrescription);

    @Modifying
    @Transactional
    @Query("DELETE FROM PrescriptionMedicament pm WHERE pm.idPrescription = :prescriptionId")
    void deleteByPrescriptionId(@Param("prescriptionId") Integer prescriptionId);
}