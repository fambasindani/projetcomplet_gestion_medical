package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.Examen;
import adc.gestion_hospitaliere.Entity.Hospitalisation;
import adc.gestion_hospitaliere.Enums.StatutHospitalisation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;


@Repository
public interface HospitalisationRepository extends JpaRepository<Hospitalisation, Integer> {
   // List<Hospitalisation> findByPatientId(Integer idPatient);
   @Query("SELECT h FROM Hospitalisation h WHERE h.patient.idPatient = :patientId")
   List<Hospitalisation> findByPatientId(@Param("patientId") Integer patientId);

    boolean existsByNumeroAdmission(String numeroAdmission);


    Page<Hospitalisation> findByIdPatient(Integer idPatient, Pageable pageable);
    Page<Hospitalisation> findByIdMedecinResponsable(Integer idMedecin, Pageable pageable);
    Page<Hospitalisation> findByStatut(StatutHospitalisation statut, Pageable pageable);

    boolean existsByIdChambreAndStatut(Integer idChambre, StatutHospitalisation statut);

    @Query("SELECT h FROM Hospitalisation h WHERE " +
            "(:statut IS NULL OR h.statut = :statut) AND " +
            "(:idPatient IS NULL OR h.idPatient = :idPatient) AND " +
            "(:dateStart IS NULL OR h.dateAdmission >= :dateStart) AND " +
            "(:dateEnd IS NULL OR h.dateAdmission <= :dateEnd)")
    Page<Hospitalisation> search(@Param("statut") StatutHospitalisation statut,
                                 @Param("idPatient") Integer idPatient,
                                 @Param("dateStart") LocalDateTime dateStart,
                                 @Param("dateEnd") LocalDateTime dateEnd,
                                 Pageable pageable);


}