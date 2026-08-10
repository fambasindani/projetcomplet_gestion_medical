package adc.gestion_hospitaliere.Repository;
import adc.gestion_hospitaliere.Entity.CategorieExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CategorieExamenRepository extends JpaRepository<CategorieExamen, Integer> {
    Optional<CategorieExamen> findByCode(String code);
}
