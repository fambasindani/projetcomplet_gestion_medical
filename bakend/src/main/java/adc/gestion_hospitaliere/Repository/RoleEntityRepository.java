package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleEntityRepository extends JpaRepository<RoleEntity, Long> {
    Optional<RoleEntity> findByNom(String nom);
}
