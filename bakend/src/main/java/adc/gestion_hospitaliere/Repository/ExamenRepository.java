package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Examen;
import adc.gestion_hospitaliere.Entity.Prescription;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ExamenRepository extends JpaRepository<Examen, Integer> {
    @Query("SELECT e FROM Examen e WHERE e.patient.idPatient = :patientId")
    List<Examen> findByPatientId(@Param("patientId") Integer patientId);

    boolean existsByNumeroExamen(String numeroExamen);

    List<Examen> findByIdPatient(Integer patientId);
    List<Examen> findByIdMedecinPrescripteur(Integer medecinId);
    Page<Examen> findByStatut(StatutExamen statut, Pageable pageable);

    List<Examen> findByIdPrescription(Integer prescriptionId);


}
