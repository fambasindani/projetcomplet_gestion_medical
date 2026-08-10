package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.ConstanteHospitalisation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ConstanteHospitalisationRepository extends JpaRepository<ConstanteHospitalisation, Integer> {
    Page<ConstanteHospitalisation> findByIdHospitalisation(Integer idHospitalisation, Pageable pageable);
    List<ConstanteHospitalisation> findByIdHospitalisationOrderByDateMesureDesc(Integer idHospitalisation);
}