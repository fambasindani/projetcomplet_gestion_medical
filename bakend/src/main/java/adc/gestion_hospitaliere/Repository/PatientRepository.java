package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.GroupeSanguin;
import adc.gestion_hospitaliere.Enums.SituationFamiliale;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Integer> {
    boolean existsByNumeroSecuriteSociale(String numero);
    boolean existsByNumeroSecuriteSocialeAndIdPatientNot(String numero, Integer id);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdPatientNot(String email, Integer id);
    long countByDateEnregistrementAfter(LocalDateTime date);
    long countByGenre(Genre genre);
    long countByGroupeSanguin(GroupeSanguin groupeSanguin);
    long countBySituationFamiliale(SituationFamiliale situationFamiliale);

    // Alternative : compter par genre avec une requête JPQL explicite (si besoin)
    @Query("SELECT COUNT(p) FROM Patient p WHERE p.genre = :genre")
    long countPatientsByGenre(@Param("genre") Genre genre);

    Page<Patient> findByGenre(Genre genre, Pageable pageable);

    @Query("SELECT p FROM Patient p WHERE LOWER(p.nom) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :term, '%')) OR " +
            "LOWER(p.numeroSecuriteSociale) LIKE LOWER(CONCAT('%', :term, '%'))")
    Page<Patient> searchByTerm(@Param("term") String term, Pageable pageable);
}