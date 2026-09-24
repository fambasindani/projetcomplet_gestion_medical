package adc.gestion_hospitaliere.dto.rbac;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PermissionDto {
    private Long id;
    private String code;
    private String libelle;
    private String module;
}
