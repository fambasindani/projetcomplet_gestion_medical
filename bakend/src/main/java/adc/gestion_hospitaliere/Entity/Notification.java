package adc.gestion_hospitaliere.Entity;

import adc.gestion_hospitaliere.Enums.TypeNotification;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_notification")
    private Integer idNotification;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_notification", nullable = false, length = 50)
    private TypeNotification typeNotification;

    @Column(name = "titre", nullable = false, length = 255)
    private String titre;

    @Column(name = "message", length = 1000)
    private String message;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "reference_id")
    private Integer referenceId;

    @Column(name = "lue")
    private Boolean lue = false;

    @CreationTimestamp
    @Column(name = "date_creation", updatable = false)
    private LocalDateTime dateCreation;
}
