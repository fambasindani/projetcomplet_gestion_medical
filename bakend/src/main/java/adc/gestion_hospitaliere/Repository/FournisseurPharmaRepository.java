package adc.gestion_hospitaliere.Repository;

import adc.gestion_hospitaliere.Entity.FournisseurPharma;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FournisseurPharmaRepository extends JpaRepository<FournisseurPharma, Integer> {
    Page<FournisseurPharma> findByNomFournisseurContainingIgnoreCase(String nom, Pageable pageable);
    boolean existsByNomFournisseurIgnoreCase(String nom);
    boolean existsByNomFournisseurIgnoreCaseAndIdFournisseurNot(String nom, Integer id);

    Page<FournisseurPharma> findByNomFournisseurContainingIgnoreCaseAndActif(String nom, Boolean actif, Pageable pageable);
    Page<FournisseurPharma> findByActif(Boolean actif, Pageable pageable);
}