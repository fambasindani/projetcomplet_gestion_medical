package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.CommandeFournisseur;
import adc.gestion_hospitaliere.Enums.StatutCommandeFournisseur;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;

public interface CommandeFournisseurRepository extends JpaRepository<CommandeFournisseur, Integer> {
    Page<CommandeFournisseur> findByStatut(StatutCommandeFournisseur statut, Pageable pageable);
    Page<CommandeFournisseur> findByIdFournisseur(Integer idFournisseur, Pageable pageable);

    @Query("SELECT c FROM CommandeFournisseur c WHERE " +
            "(:statut IS NULL OR c.statut = :statut) AND " +
            "(:idFournisseur IS NULL OR c.idFournisseur = :idFournisseur) AND " +
            "(:dateStart IS NULL OR c.dateCommande >= :dateStart) AND " +
            "(:dateEnd IS NULL OR c.dateCommande <= :dateEnd)")
    Page<CommandeFournisseur> search(@Param("statut") StatutCommandeFournisseur statut,
                                     @Param("idFournisseur") Integer idFournisseur,
                                     @Param("dateStart") LocalDateTime dateStart,
                                     @Param("dateEnd") LocalDateTime dateEnd,
                                     Pageable pageable);
}