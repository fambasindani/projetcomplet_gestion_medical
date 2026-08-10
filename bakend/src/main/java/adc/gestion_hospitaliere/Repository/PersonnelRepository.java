package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Enums.Genre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface PersonnelRepository extends JpaRepository<Personnel, Integer> {
    // Unicité
    boolean existsByMatricule(String matricule);
    boolean existsByMatriculeAndIdPersonnelNot(String matricule, Integer id);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdPersonnelNot(String email, Integer id);

    //recherche email
    Optional<Personnel> findByEmail(String email);

    // Recherche par fonction
    Page<Personnel> findByFonctionContainingIgnoreCase(String fonction, Pageable pageable);

    // Recherche par service
    Page<Personnel> findByServiceContainingIgnoreCase(String service, Pageable pageable);

    // Recherche textuelle (nom, prénom, matricule)
    @Query("SELECT p FROM Personnel p WHERE " +
            "LOWER(p.matricule) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(p.fonction) LIKE LOWER(CONCAT('%', :term, '%'))")
    Page<Personnel> searchByKeyword(@Param("term") String term, Pageable pageable);

    // Statistiques
    long countByFonction(String fonction);
    long countByService(String service);
}