package adc.gestion_hospitaliere.dto.notification;

import adc.gestion_hospitaliere.Enums.TypeNotification;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NotificationRequestDto {
    @NotNull
    private TypeNotification typeNotification;

    @NotBlank
    private String titre;

    private String message;

    private String referenceType;

    private Integer referenceId;

    private Boolean lue;
}
