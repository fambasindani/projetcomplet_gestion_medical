package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Paiement;
import adc.gestion_hospitaliere.Enums.ModePaiement;
import adc.gestion_hospitaliere.Enums.StatutPaiement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, Integer> {
    List<Paiement> findByFactureIdFacture(Integer idFacture);

    long countByFactureIdFacture(Integer idFacture);

    @Query(value = "SELECT p FROM Paiement p LEFT JOIN FETCH p.facture f LEFT JOIN FETCH f.patient WHERE " +
            "(:modePaiement IS NULL OR p.modePaiement = :modePaiement) AND " +
            "(:statut IS NULL OR p.statut = :statut) AND " +
            "(:encaissePar IS NULL OR p.encaissePar = :encaissePar) AND " +
            "(:dateStart IS NULL OR p.datePaiement >= :dateStart) AND " +
            "(:dateEnd IS NULL OR p.datePaiement <= :dateEnd) AND " +
            "(:term IS NULL OR LOWER(p.referencePaiement) LIKE LOWER(CONCAT('%', :term, '%'))) " +
            "ORDER BY p.datePaiement DESC",
            countQuery = "SELECT COUNT(p) FROM Paiement p WHERE " +
            "(:modePaiement IS NULL OR p.modePaiement = :modePaiement) AND " +
            "(:statut IS NULL OR p.statut = :statut) AND " +
            "(:encaissePar IS NULL OR p.encaissePar = :encaissePar) AND " +
            "(:dateStart IS NULL OR p.datePaiement >= :dateStart) AND " +
            "(:dateEnd IS NULL OR p.datePaiement <= :dateEnd) AND " +
            "(:term IS NULL OR LOWER(p.referencePaiement) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<Paiement> searchPaiements(@Param("modePaiement") ModePaiement modePaiement,
                                   @Param("statut") StatutPaiement statut,
                                   @Param("encaissePar") Integer encaissePar,
                                   @Param("dateStart") LocalDateTime dateStart,
                                   @Param("dateEnd") LocalDateTime dateEnd,
                                   @Param("term") String term,
                                   Pageable pageable);
}