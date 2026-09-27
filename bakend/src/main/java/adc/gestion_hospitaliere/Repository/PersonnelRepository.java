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

    // Recherche combinée : mot-clé (nom, prénom, matricule, fonction) + fonction + genre, tous optionnels.
    @Query("SELECT p FROM Personnel p WHERE " +
            "(:term IS NULL OR :term = '' OR " +
            " LOWER(p.matricule) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            " LOWER(p.nom) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            " LOWER(p.prenom) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            " LOWER(p.fonction) LIKE LOWER(CONCAT('%', :term, '%'))) AND " +
            "(:fonction IS NULL OR :fonction = '' OR LOWER(p.fonction) LIKE LOWER(CONCAT('%', :fonction, '%'))) AND " +
            "(:genre IS NULL OR p.genre = :genre)")
    Page<Personnel> search(@Param("term") String term,
                           @Param("fonction") String fonction,
                           @Param("genre") Genre genre,
                           Pageable pageable);

    // Statistiques
    long countByFonction(String fonction);
    long countByService(String service);
}