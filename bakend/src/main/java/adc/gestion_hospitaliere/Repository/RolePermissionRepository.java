package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.RolePermission;
import adc.gestion_hospitaliere.Entity.RolePermissionId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, RolePermissionId> {

    @Query("SELECT rp FROM RolePermission rp JOIN FETCH rp.permission WHERE rp.role.id = :idRole")
    List<RolePermission> findByIdRole(@Param("idRole") Long idRole);

    @Modifying
    @Query("DELETE FROM RolePermission rp WHERE rp.role.id = :idRole")
    void deleteByIdRole(@Param("idRole") Long idRole);

    @Modifying
    @Query("DELETE FROM RolePermission rp WHERE rp.permission.id = :idPermission")
    void deleteByIdPermission(@Param("idPermission") Long idPermission);
}
