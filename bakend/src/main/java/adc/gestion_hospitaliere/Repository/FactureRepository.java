package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Facture;
import adc.gestion_hospitaliere.Enums.StatutFacture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface FactureRepository extends JpaRepository<Facture, Integer> {
    boolean existsByNumeroFacture(String numeroFacture);

    @Query("SELECT COUNT(d) > 0 FROM DetailFacture d " +
            "JOIN Facture f ON d.idFacture = f.idFacture " +
            "WHERE d.source = :source AND d.idSource = :idSource " +
            "AND f.statut <> adc.gestion_hospitaliere.Enums.StatutFacture.Annulé")
    boolean existsDetailFactureNonAnnule(@Param("source") String source, @Param("idSource") Integer idSource);

    // Consultations déjà facturées (facture non annulée)
    @Query("SELECT DISTINCT f.idConsultation FROM Facture f " +
            "WHERE f.idConsultation IS NOT NULL AND f.statut <> adc.gestion_hospitaliere.Enums.StatutFacture.Annulé")
    List<Integer> findConsultationsFacturees();

    // Hospitalisations déjà facturées (facture non annulée)
    @Query("SELECT DISTINCT f.idHospitalisation FROM Facture f " +
            "WHERE f.idHospitalisation IS NOT NULL AND f.statut <> adc.gestion_hospitaliere.Enums.StatutFacture.Annulé")
    List<Integer> findHospitalisationsFacturees();

    // Descriptions des anciens détails (sans source) déjà facturés : sert de repli pour
    // les factures créées avant la traçabilité source/id_source.
    @Query("SELECT DISTINCT d.description FROM DetailFacture d " +
            "JOIN Facture f ON d.idFacture = f.idFacture " +
            "WHERE d.source IS NULL AND f.statut <> adc.gestion_hospitaliere.Enums.StatutFacture.Annulé")
    List<String> findLegacyDescriptionsFacturees();

    @Query("SELECT f FROM Facture f WHERE " +
            "(:statut IS NULL OR f.statut = :statut) AND " +
            "(:idPatient IS NULL OR f.idPatient = :idPatient) AND " +
            "(:dateStart IS NULL OR f.dateEmission >= :dateStart) AND " +
            "(:dateEnd IS NULL OR f.dateEmission <= :dateEnd)")
    Page<Facture> searchFactures(@Param("statut") StatutFacture statut,
                                 @Param("idPatient") Integer idPatient,
                                 @Param("dateStart") LocalDateTime dateStart,
                                 @Param("dateEnd") LocalDateTime dateEnd,
                                 Pageable pageable);

    @Query("SELECT COALESCE(SUM(f.montantTtc), 0) FROM Facture f")
    BigDecimal sumMontantTtc();

    @Query("SELECT COALESCE(SUM(f.montantPaye), 0) FROM Facture f")
    BigDecimal sumMontantPaye();

    @Query("SELECT COALESCE(SUM(f.montantRestant), 0) FROM Facture f")
    BigDecimal sumMontantRestant();

    @Query("SELECT f.statut, COUNT(f), COALESCE(SUM(f.montantTtc), 0), COALESCE(SUM(f.montantPaye), 0) " +
            "FROM Facture f GROUP BY f.statut")
    List<Object[]> statsParStatut();

    @Query("SELECT FUNCTION('FORMAT', f.dateEmission, 'yyyy-MM') as mois, COUNT(f), COALESCE(SUM(f.montantTtc), 0) " +
            "FROM Facture f GROUP BY mois ORDER BY mois ASC")
    List<Object[]> statsParMois();
}
