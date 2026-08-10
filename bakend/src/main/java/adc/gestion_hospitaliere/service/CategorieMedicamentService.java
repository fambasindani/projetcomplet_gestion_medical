package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.CategorieMedicament;
import adc.gestion_hospitaliere.Repository.CategorieMedicamentRepository;
import adc.gestion_hospitaliere.dto.categorie.CategorieRequestDto;
import adc.gestion_hospitaliere.dto.categorie.CategorieResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategorieMedicamentService {

    private final CategorieMedicamentRepository repository;

    public Page<CategorieResponseDto> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<CategorieResponseDto> search(String nom, Pageable pageable) {
        return repository.findByNomCategorieContainingIgnoreCase(nom, pageable).map(this::toResponseDto);
    }

    public CategorieResponseDto getById(Integer id) {
        CategorieMedicament c = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée"));
        return toResponseDto(c);
    }

    @Transactional
    public CategorieResponseDto create(CategorieRequestDto dto) {
        if (repository.existsByNomCategorieIgnoreCase(dto.getNomCategorie())) {
            throw new BusinessException("Une catégorie avec ce nom existe déjà");
        }
        CategorieMedicament c = new CategorieMedicament();
        c.setNomCategorie(dto.getNomCategorie());
        c.setDescription(dto.getDescription());
        c.setCodeCategorie(dto.getCodeCategorie());
        c = repository.save(c);
        return toResponseDto(c);
    }

    @Transactional
    public CategorieResponseDto update(Integer id, CategorieRequestDto dto) {
        CategorieMedicament c = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée"));
        if (repository.existsByNomCategorieIgnoreCaseAndIdCategorieNot(dto.getNomCategorie(), id)) {
            throw new BusinessException("Une autre catégorie avec ce nom existe déjà");
        }
        c.setNomCategorie(dto.getNomCategorie());
        c.setDescription(dto.getDescription());
        c.setCodeCategorie(dto.getCodeCategorie());
        c = repository.save(c);
        return toResponseDto(c);
    }

    @Transactional
    public void delete(Integer id) {
        CategorieMedicament c = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée"));
        // Vérifier si des médicaments y sont rattachés
        if (c.getMedicaments() != null && !c.getMedicaments().isEmpty()) {
            throw new BusinessException("Impossible de supprimer une catégorie qui contient des médicaments");
        }
        repository.delete(c);
    }

    private CategorieResponseDto toResponseDto(CategorieMedicament c) {
        return CategorieResponseDto.builder()
                .idCategorie(c.getIdCategorie())
                .nomCategorie(c.getNomCategorie())
                .description(c.getDescription())
                .codeCategorie(c.getCodeCategorie())
                .nombreMedicaments(c.getMedicaments() != null ? c.getMedicaments().size() : 0)
                .build();
    }
}