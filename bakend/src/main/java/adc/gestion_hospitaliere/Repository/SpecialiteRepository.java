package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.Specialite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface SpecialiteRepository extends JpaRepository<Specialite, Integer> {

    boolean existsByNomSpecialiteIgnoreCase(String nomSpecialite);

    boolean existsByNomSpecialiteIgnoreCaseAndIdSpecialiteNot(String nomSpecialite, Integer id);

    Page<Specialite> findByActifTrue(Pageable pageable);

    Page<Specialite> findByNomSpecialiteContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            String nom, String description, Pageable pageable);

    @Query("SELECT s FROM Specialite s WHERE s.medecins IS EMPTY")
    Page<Specialite> findSpecialitesSansMedecins(Pageable pageable);

    @Query("SELECT s FROM Specialite s WHERE s.medecins IS NOT EMPTY")
    Page<Specialite> findSpecialitesAvecMedecins(Pageable pageable);

    // ✅ Méthode ajoutée pour compter les spécialités actives
    long countByActifTrue();
}