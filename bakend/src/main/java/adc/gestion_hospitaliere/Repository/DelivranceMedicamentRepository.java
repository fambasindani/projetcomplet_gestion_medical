package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.DelivranceMedicament;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;

@Repository
public interface DelivranceMedicamentRepository extends JpaRepository<DelivranceMedicament, Integer> {



    // Pagination simple
    Page<DelivranceMedicament> findAll(Pageable pageable);

    // Recherche par mot-clé sur numéro ordonnance et observations
    @Query("SELECT d FROM DelivranceMedicament d WHERE " +
            "LOWER(d.numeroOrdonnance) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(d.observations) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<DelivranceMedicament> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // Recherche par période
    Page<DelivranceMedicament> findByDateDelivranceBetween(LocalDateTime debut, LocalDateTime fin, Pageable pageable);

    // Par patient
    Page<DelivranceMedicament> findByIdPatient(Integer patientId, Pageable pageable);

    // Par pharmacien
    Page<DelivranceMedicament> findByIdPharmacien(Integer pharmacienId, Pageable pageable);

    // Comptes pour statistiques
    long countByDateDelivranceBetween(LocalDateTime debut, LocalDateTime fin);
    long count();
}