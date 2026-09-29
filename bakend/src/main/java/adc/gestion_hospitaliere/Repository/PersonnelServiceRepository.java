package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.PersonnelService;
import adc.gestion_hospitaliere.Entity.PersonnelServiceId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PersonnelServiceRepository extends JpaRepository<PersonnelService, PersonnelServiceId> {
    List<PersonnelService> findByIdPersonnel(Integer idPersonnel);
    List<PersonnelService> findByIdService(Integer idService);
    void deleteByIdPersonnel(Integer idPersonnel);
}