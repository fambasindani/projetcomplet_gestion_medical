package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Examen;
import adc.gestion_hospitaliere.Entity.Prescription;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;


@Repository
public interface ExamenRepository extends JpaRepository<Examen, Integer> {
    @Query("SELECT e FROM Examen e WHERE e.patient.idPatient = :patientId")
    List<Examen> findByPatientId(@Param("patientId") Integer patientId);

    boolean existsByNumeroExamen(String numeroExamen);

    List<Examen> findByIdPatient(Integer patientId);
    List<Examen> findByIdMedecinPrescripteur(Integer medecinId);
    Page<Examen> findByIdMedecinPrescripteur(Integer medecinId, Pageable pageable);
    Page<Examen> findByStatut(StatutExamen statut, Pageable pageable);

    @Query("SELECT e FROM Examen e WHERE e.idPatient = :idPatient AND e.statut IN :statuts " +
            "ORDER BY COALESCE(e.dateRealisation, e.datePrescription) DESC")
    Page<Examen> findByPatientAndStatuts(@Param("idPatient") Integer idPatient,
                                         @Param("statuts") java.util.List<StatutExamen> statuts,
                                         Pageable pageable);

    List<Examen> findByIdPrescription(Integer prescriptionId);

    Page<Examen> findByIdLaboratoire(Integer idLaboratoire, Pageable pageable);
    List<Examen> findByIdLaboratoire(Integer idLaboratoire);



    @Query("SELECT e FROM Examen e WHERE e.categorie IS NOT NULL AND LOWER(e.categorie.libelle) = LOWER(:libelle)")
    Page<Examen> findByCategorieLibelle(@Param("libelle") String libelle, Pageable pageable);

    /**
     * Recherche paginée des examens avec filtres optionnels.
     * Le scoping (médecin / laboratoire) est passé en paramètre nullable :
     *   - idMedecin non null  => seulement les examens prescrits par ce médecin
     *   - idLaboratoire non null => seulement les examens de ce laboratoire
     */
    @Query("SELECT e FROM Examen e LEFT JOIN e.categorie c LEFT JOIN e.patient p WHERE " +
            "(:idMedecin IS NULL OR e.idMedecinPrescripteur = :idMedecin) AND " +
            "(:idLaboratoire IS NULL OR e.idLaboratoire = :idLaboratoire) AND " +
            "(:statut IS NULL OR e.statut = :statut) AND " +
            "(:idCategorie IS NULL OR c.idCategorieExamen = :idCategorie) AND " +
            "(:term IS NULL OR LOWER(e.numeroExamen) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(e.typeExamen) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(c.libelle) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(p.nom) LIKE LOWER(CONCAT('%', :term, '%')) " +
            "  OR LOWER(p.prenom) LIKE LOWER(CONCAT('%', :term, '%')))")
    Page<Examen> searchExamens(@Param("idMedecin") Integer idMedecin,
                               @Param("idLaboratoire") Integer idLaboratoire,
                               @Param("statut") StatutExamen statut,
                               @Param("idCategorie") Integer idCategorie,
                               @Param("term") String term,
                               Pageable pageable);
}
