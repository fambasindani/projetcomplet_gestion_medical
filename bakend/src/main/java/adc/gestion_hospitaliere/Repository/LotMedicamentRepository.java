package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.LotMedicament;
import adc.gestion_hospitaliere.Enums.StatutLot;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface LotMedicamentRepository extends JpaRepository<LotMedicament, Integer> {
    // Recherche avec filtres : médicament, numéro lot, statut

    // LotMedicamentRepository.java
    List<LotMedicament> findByIdMedicament(Integer idMedicament);
    @Query("SELECT l FROM LotMedicament l WHERE " +
            "(:idMedicament IS NULL OR l.idMedicament = :idMedicament) AND " +
            "(:numeroLot IS NULL OR l.numeroLot LIKE %:numeroLot%) AND " +
            "(:statut IS NULL OR l.statut = :statut)")
    Page<LotMedicament> search(@Param("idMedicament") Integer idMedicament,
                               @Param("numeroLot") String numeroLot,
                               @Param("statut") StatutLot statut,
                               Pageable pageable);
}

