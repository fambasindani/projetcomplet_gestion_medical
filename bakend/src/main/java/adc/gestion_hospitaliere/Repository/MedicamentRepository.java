package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.Medicament;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MedicamentRepository extends JpaRepository<Medicament, Integer> {
    boolean existsByCodeCip(String codeCip);
    boolean existsByCodeCipAndIdMedicamentNot(String codeCip, Integer id);
    Page<Medicament> findByNomCommercialContainingIgnoreCase(String nom, Pageable pageable);
    Page<Medicament> findByIdCategorie(Integer idCategorie, Pageable pageable);
    Page<Medicament> findByActifTrue(Pageable pageable);
    Page<Medicament> findByGeneriqueTrue(Pageable pageable);

    @Query("SELECT m FROM Medicament m WHERE " +
            "(:nom IS NULL OR LOWER(m.nomCommercial) LIKE LOWER(CONCAT('%', :nom, '%'))) AND " +
            "(:idCategorie IS NULL OR m.idCategorie = :idCategorie) AND " +
            "(:actif IS NULL OR m.actif = :actif)")
    Page<Medicament> search(@Param("nom") String nom,
                            @Param("idCategorie") Integer idCategorie,
                            @Param("actif") Boolean actif,
                            Pageable pageable);
}