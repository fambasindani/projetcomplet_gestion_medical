package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.UserRole;
import adc.gestion_hospitaliere.Entity.UserRoleId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, UserRoleId> {

    @Query("SELECT ur FROM UserRole ur JOIN FETCH ur.role WHERE ur.utilisateur.id = :idUtilisateur")
    List<UserRole> findByIdUtilisateur(@Param("idUtilisateur") Long idUtilisateur);

    @Modifying
    @Query("DELETE FROM UserRole ur WHERE ur.utilisateur.id = :idUtilisateur")
    void deleteByIdUtilisateur(@Param("idUtilisateur") Long idUtilisateur);

    @Query("SELECT COUNT(ur) FROM UserRole ur WHERE ur.role.id = :idRole")
    long countByIdRole(@Param("idRole") Long idRole);
}
