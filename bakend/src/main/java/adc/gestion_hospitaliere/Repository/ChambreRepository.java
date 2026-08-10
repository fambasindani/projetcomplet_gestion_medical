package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.Chambre;
import adc.gestion_hospitaliere.Enums.StatutChambre;
import adc.gestion_hospitaliere.Enums.TypeChambre;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ChambreRepository extends JpaRepository<Chambre, Integer> {
    Page<Chambre> findByStatut(StatutChambre statut, Pageable pageable);
    Page<Chambre> findByTypeChambre(TypeChambre type, Pageable pageable);
    Page<Chambre> findByBatimentContainingIgnoreCase(String batiment, Pageable pageable);

    @Query("SELECT c FROM Chambre c WHERE " +
            "(:statut IS NULL OR c.statut = :statut) AND " +
            "(:type IS NULL OR c.typeChambre = :type) AND " +
            "(:etage IS NULL OR c.etage = :etage)")
    Page<Chambre> searchChambres(@Param("statut") StatutChambre statut,
                                 @Param("type") TypeChambre type,
                                 @Param("etage") Integer etage,
                                 Pageable pageable);

    boolean existsByNumeroChambre(String numeroChambre);
    boolean existsByNumeroChambreAndIdChambreNot(String numeroChambre, Integer id);
}
