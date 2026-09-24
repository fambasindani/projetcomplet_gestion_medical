package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Notification;
import adc.gestion_hospitaliere.Enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    Page<Notification> findAllByOrderByDateCreationDesc(Pageable pageable);

    Page<Notification> findByLue(boolean lue, Pageable pageable);

    long countByLue(boolean lue);

    // Notifications visibles par un utilisateur : ciblées sur son rôle OU sur son id OU générales.
    @Query("SELECT n FROM Notification n WHERE " +
            "(:role IS NULL OR n.roleDestinataire IS NULL OR n.roleDestinataire = :role) AND " +
            "(:userId IS NULL OR n.idDestinataire IS NULL OR n.idDestinataire = :userId) " +
            "ORDER BY n.dateCreation DESC")
    Page<Notification> findPourUtilisateur(@Param("role") Role role,
                                           @Param("userId") Long userId,
                                           Pageable pageable);

    @Query("SELECT n FROM Notification n WHERE n.lue = false AND " +
            "(:role IS NULL OR n.roleDestinataire IS NULL OR n.roleDestinataire = :role) AND " +
            "(:userId IS NULL OR n.idDestinataire IS NULL OR n.idDestinataire = :userId) " +
            "ORDER BY n.dateCreation DESC")
    Page<Notification> findNonLuesPourUtilisateur(@Param("role") Role role,
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
