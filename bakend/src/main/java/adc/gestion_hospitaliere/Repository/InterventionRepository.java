package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.Examen;
import adc.gestion_hospitaliere.Entity.Hospitalisation;
import adc.gestion_hospitaliere.Entity.Intervention;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface InterventionRepository extends JpaRepository<Intervention, Integer> {
    @Query("SELECT i FROM Intervention i WHERE i.patient.idPatient = :patientId")
    List<Intervention> findByPatientId(@Param("patientId") Integer patientId);

}
