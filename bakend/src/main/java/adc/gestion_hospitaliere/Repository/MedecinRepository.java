package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Enums.Disponibilite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface MedecinRepository extends JpaRepository<Medecin, Integer> {

    // Unicité
    boolean existsByMatricule(String matricule);
    boolean existsByMatriculeAndIdMedecinNot(String matricule, Integer id);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdMedecinNot(String email, Integer id);
    boolean existsByNumeroOrdre(String numeroOrdre);
    boolean existsByNumeroOrdreAndIdMedecinNot(String numeroOrdre, Integer id);

    // Par disponibilité
    Page<Medecin> findByDisponibilite(Disponibilite disponibilite, Pageable pageable);

    Optional<Medecin> findByEmail(String email);

    // Par spécialité
    Page<Medecin> findByIdSpecialite(Integer specialiteId, Pageable pageable);

    // Recherche textuelle
    @Query("SELECT m FROM Medecin m LEFT JOIN FETCH m.specialite WHERE " +
            "LOWER(m.matricule) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(m.nom) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(m.prenom) LIKE LOWER(CONCAT('%', :term, '%'))")
    Page<Medecin> searchByTerm(@Param("term") String term, Pageable pageable);

    // Statistiques
    long countByDateCreationAfter(LocalDateTime date);
    long countByDisponibilite(Disponibilite disponibilite);
}