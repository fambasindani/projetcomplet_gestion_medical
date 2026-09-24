package adc.gestion_hospitaliere.Entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RolePermissionId implements Serializable {

    @Column(name = "id_role")
    private Long idRole;

    @Column(name = "id_permission")
    private Long idPermission;
}
