package adc.gestion_hospitaliere.dto.rbac;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class RoleDto {
    private Long id;
    private String nom;
    private String description;
    private List<String> permissions;
}
