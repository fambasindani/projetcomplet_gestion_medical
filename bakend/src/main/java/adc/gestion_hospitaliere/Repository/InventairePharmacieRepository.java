package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.InventairePharmacie;
import adc.gestion_hospitaliere.Enums.StatutInventaire;
import adc.gestion_hospitaliere.Enums.TypeInventaire;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InventairePharmacieRepository extends JpaRepository<InventairePharmacie, Integer> {
    Page<InventairePharmacie> findByStatut(StatutInventaire statut, Pageable pageable);
    Page<InventairePharmacie> findByTypeInventaire(TypeInventaire type, Pageable pageable);
    List<InventairePharmacie> findByDateInventaireBetween(LocalDateTime start, LocalDateTime end);

    @Query("SELECT i FROM InventairePharmacie i WHERE " +
            "(:statut IS NULL OR i.statut = :statut) AND " +
            "(:type IS NULL OR i.typeInventaire = :type) AND " +
            "(:start IS NULL OR i.dateInventaire >= :start) AND " +
            "(:end IS NULL OR i.dateInventaire <= :end)")
    Page<InventairePharmacie> search(@Param("statut") StatutInventaire statut,
                                     @Param("type") TypeInventaire type,
                                     @Param("start") LocalDateTime start,
                                     @Param("end") LocalDateTime end,
                                     Pageable pageable);
}