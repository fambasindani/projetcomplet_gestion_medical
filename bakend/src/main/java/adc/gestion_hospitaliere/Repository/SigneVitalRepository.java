package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.SigneVital;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SigneVitalRepository extends JpaRepository<SigneVital, Integer> {
    Page<SigneVital> findByIdPatientOrderByDateMesureDesc(Integer idPatient, Pageable pageable);
    List<SigneVital> findByIdPatientOrderByDateMesureDesc(Integer idPatient);
}
