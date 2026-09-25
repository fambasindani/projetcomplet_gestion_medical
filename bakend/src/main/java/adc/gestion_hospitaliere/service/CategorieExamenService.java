package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.CategorieExamen;
import adc.gestion_hospitaliere.Repository.CategorieExamenRepository;
import adc.gestion_hospitaliere.dto.categorieExamen.CategorieExamenRequestDto;
import adc.gestion_hospitaliere.dto.categorieExamen.CategorieExamenResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategorieExamenService {

    private final CategorieExamenRepository repository;

    public Page<CategorieExamenResponseDto> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toDto);
    }

    public List<CategorieExamenResponseDto> getAllList() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    public CategorieExamenResponseDto getById(Integer id) {
        return toDto(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée")));
    }

    @Transactional
    public CategorieExamenResponseDto create(CategorieExamenRequestDto dto) {
        if (repository.findByCode(dto.getCode()).isPresent()) {
            throw new BusinessException("Code déjà existant");
        }
        CategorieExamen entity = new CategorieExamen();
        entity.setCode(dto.getCode());
        entity.setLibelle(dto.getLibelle());
        entity.setDescription(dto.getDescription());
        entity.setActif(dto.getActif() != null ? dto.getActif() : true);
        entity.setIdGroupeCatalogue(dto.getIdGroupeCatalogue());
        return toDto(repository.save(entity));
    }

    @Transactional
    public CategorieExamenResponseDto update(Integer id, CategorieExamenRequestDto dto) {
        CategorieExamen entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée"));
        if (!entity.getCode().equals(dto.getCode())) {
            if (repository.findByCode(dto.getCode()).isPresent()) {
                throw new BusinessException("Code déjà utilisé par une autre catégorie");
            }
        }
        entity.setCode(dto.getCode());
        entity.setLibelle(dto.getLibelle());
        entity.setDescription(dto.getDescription());
        if (dto.getActif() != null) entity.setActif(dto.getActif());
        entity.setIdGroupeCatalogue(dto.getIdGroupeCatalogue());
        return toDto(repository.save(entity));
    }

    @Transactional
    public void delete(Integer id) {
        if (!repository.existsById(id)) {
            throw new ResourceNotFoundException("Catégorie non trouvée");
        }
        repository.deleteById(id);
    }

    private CategorieExamenResponseDto toDto(CategorieExamen entity) {
        return CategorieExamenResponseDto.builder()
                .idCategorieExamen(entity.getIdCategorieExamen())
                .code(entity.getCode())
                .libelle(entity.getLibelle())
                .description(entity.getDescription())
                .actif(entity.getActif())
                .idGroupeCatalogue(entity.getIdGroupeCatalogue())
                .groupeCatalogueLibelle(entity.getGroupeCatalogue() != null ? entity.getGroupeCatalogue().getLibelle() : null)
                .dateCreation(entity.getDateCreation())
                .build();
    }
}