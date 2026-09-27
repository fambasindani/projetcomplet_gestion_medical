package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.PersonnelLaboratoire;
import adc.gestion_hospitaliere.Entity.PersonnelLaboratoireId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonnelLaboratoireRepository extends JpaRepository<PersonnelLaboratoire, PersonnelLaboratoireId> {
    List<PersonnelLaboratoire> findByIdPersonnel(Integer idPersonnel);
    List<PersonnelLaboratoire> findByIdLaboratoire(Integer idLaboratoire);
    Optional<PersonnelLaboratoire> findFirstByIdPersonnel(Integer idPersonnel);
    void deleteByIdPersonnel(Integer idPersonnel);
}