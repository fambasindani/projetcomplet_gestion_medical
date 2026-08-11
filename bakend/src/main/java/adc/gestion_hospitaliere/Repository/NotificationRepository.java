package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    Page<Notification> findAllByOrderByDateCreationDesc(Pageable pageable);

    Page<Notification> findByLue(boolean lue, Pageable pageable);

    long countByLue(boolean lue);
}
