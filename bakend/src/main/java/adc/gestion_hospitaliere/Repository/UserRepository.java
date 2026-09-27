package adc.gestion_hospitaliere.Repository;



import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE " +
            "(:term IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :term, '%')) " +
            " OR LOWER(u.nom) LIKE LOWER(CONCAT('%', :term, '%')) " +
            " OR LOWER(u.prenom) LIKE LOWER(CONCAT('%', :term, '%'))) AND " +
            "(:role IS NULL OR u.role = :role) AND " +
            "(:actif IS NULL OR u.isActive = :actif)")
    Page<User> search(@Param("term") String term,
                      @Param("role") Role role,
                      @Param("actif") Boolean actif,
                      Pageable pageable);
}
