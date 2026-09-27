package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Notification;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Enums.TypeNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Vue administrateur : filtre optionnel sur lue et sur le type.
    @Query("SELECT n FROM Notification n WHERE " +
            "(:lue IS NULL OR n.lue = :lue) AND " +
            "(:typeNotification IS NULL OR n.typeNotification = :typeNotification) " +
            "ORDER BY n.dateCreation DESC")
    Page<Notification> findAdmin(@Param("lue") Boolean lue,
                                 @Param("typeNotification") TypeNotification typeNotification,
                                 Pageable pageable);

    Page<Notification> findByLue(boolean lue, Pageable pageable);

    long countByLue(boolean lue);

    // Notifications visibles par un utilisateur : ciblées sur son rôle OU sur son id OU générales.
    @Query("SELECT n FROM Notification n WHERE " +
            "(:typeNotification IS NULL OR n.typeNotification = :typeNotification) AND " +
            "(:role IS NULL OR n.roleDestinataire IS NULL OR n.roleDestinataire = :role) AND " +
            "(:userId IS NULL OR n.idDestinataire IS NULL OR n.idDestinataire = :userId) " +
            "ORDER BY n.dateCreation DESC")
    Page<Notification> findPourUtilisateur(@Param("typeNotification") TypeNotification typeNotification,
                                           @Param("role") Role role,
                                           @Param("userId") Long userId,
                                           Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.lue = false AND " +
            "(:typeNotification IS NULL OR n.typeNotification = :typeNotification) AND " +
            "(:role IS NULL OR n.roleDestinataire IS NULL OR n.roleDestinataire = :role) AND " +
            "(:userId IS NULL OR n.idDestinataire IS NULL OR n.idDestinataire = :userId) " +
            "ORDER BY n.dateCreation DESC")
    Page<Notification> findNonLuesPourUtilisateur(@Param("typeNotification") TypeNotification typeNotification,
                                                  @Param("role") Role role,
                                                  @Param("userId") Long userId,
                                                  Pageable pageable);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.lue = false AND " +
            "(:role IS NULL OR n.roleDestinataire IS NULL OR n.roleDestinataire = :role) AND " +
            "(:userId IS NULL OR n.idDestinataire IS NULL OR n.idDestinataire = :userId)")
    long countNonLuesPourUtilisateur(@Param("role") Role role, @Param("userId") Long userId);

    @Query("SELECT n FROM Notification n WHERE n.lue = false AND " +
            "(:role IS NULL OR n.roleDestinataire IS NULL OR n.roleDestinataire = :role) AND " +
            "(:userId IS NULL OR n.idDestinataire IS NULL OR n.idDestinataire = :userId)")
    List<Notification> findNonLuesListePourUtilisateur(@Param("role") Role role, @Param("userId") Long userId);
}
