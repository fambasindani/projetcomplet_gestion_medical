package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Consultation;
import adc.gestion_hospitaliere.Entity.Prescription;
import adc.gestion_hospitaliere.Enums.StatutPrescription;
import adc.gestion_hospitaliere.Enums.TypePrescription;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Integer> {
  //  List<Prescription> findByPatientId(Integer idPatient);
    @Query("SELECT p FROM Prescription p WHERE p.patient.idPatient = :patientId")
    List<Prescription> findByPatientId(@Param("patientId") Integer patientId);


    Page<Prescription> findByIdPatient(Integer idPatient, Pageable pageable);
    Page<Prescription> findByIdMedecin(Integer idMedecin, Pageable pageable);
    Page<Prescription> findByTypePrescription(TypePrescription type, Pageable pageable);
    Page<Prescription> findByStatut(StatutPrescription statut, Pageable pageable);

    List<Prescription> findByIdConsultation(Integer idConsultation);
    List<Prescription> findByIdHospitalisation(Integer idHospitalisation);

    boolean existsByNumeroPrescription(String numeroPrescription);

    @Query("SELECT p FROM Prescription p WHERE " +
            "(:type IS NULL OR p.typePrescription = :type) AND " +
            "(:statut IS NULL OR p.statut = :statut) AND " +
            "(:idPatient IS NULL OR p.idPatient = :idPatient) AND " +
            "(:dateStart IS NULL OR p.datePrescription >= :dateStart) AND " +
            "(:dateEnd IS NULL OR p.datePrescription <= :dateEnd)")
    Page<Prescription> search(@Param("type") TypePrescription type,
                              @Param("statut") StatutPrescription statut,
                              @Param("idPatient") Integer idPatient,
                              @Param("dateStart") LocalDateTime dateStart,
                              @Param("dateEnd") LocalDateTime dateEnd,
                              Pageable pageable);

}

