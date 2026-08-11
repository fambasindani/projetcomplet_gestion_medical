package adc.gestion_hospitaliere.dto.notification;

import adc.gestion_hospitaliere.Enums.TypeNotification;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDto {
    private Integer idNotification;
    private TypeNotification typeNotification;
    private String titre;
    private String message;
    private String referenceType;
    private Integer referenceId;
    private Boolean lue;
    private LocalDateTime dateCreation;
}
