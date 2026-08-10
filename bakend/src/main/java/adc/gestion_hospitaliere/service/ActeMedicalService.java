package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;

import adc.gestion_hospitaliere.Entity.ActeMedical;
import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import adc.gestion_hospitaliere.Repository.ActeMedicalRepository;
import adc.gestion_hospitaliere.Repository.DetailFactureRepository;
import adc.gestion_hospitaliere.dto.facture.ActeMedicalRequestDto;
import adc.gestion_hospitaliere.dto.facture.ActeMedicalResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ActeMedicalService {

    private final ActeMedicalRepository acteMedicalRepository;
    private final DetailFactureRepository detailFactureRepository;

    public Page<ActeMedicalResponseDto> getAll(Pageable pageable) {
        return acteMedicalRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<ActeMedicalResponseDto> search(String recherche, CategorieActeMedical categorie, Boolean actif, Pageable pageable) {
        return acteMedicalRepository.search(recherche, categorie, actif, pageable).map(this::toResponseDto);
    }

    public ActeMedicalResponseDto getById(Integer id) {
        return toResponseDto(getActe(id));
    }

    @Transactional
    public ActeMedicalResponseDto create(ActeMedicalRequestDto dto) {
        if (acteMedicalRepository.existsByCodeActe(dto.getCodeActe())) {
            throw new BusinessException("Un acte avec ce code existe déjà");
        }
        ActeMedical acte = new ActeMedical();
        updateEntity(acte, dto);
        return toResponseDto(acteMedicalRepository.save(acte));
    }

    @Transactional
    public ActeMedicalResponseDto update(Integer id, ActeMedicalRequestDto dto) {
        ActeMedical acte = getActe(id);
        if (acteMedicalRepository.existsByCodeActeAndIdActeNot(dto.getCodeActe(), id)) {
            throw new BusinessException("Un autre acte avec ce code existe déjà");
        }
        updateEntity(acte, dto);
        return toResponseDto(acteMedicalRepository.save(acte));
    }

    @Transactional
    public void delete(Integer id) {
        ActeMedical acte = getActe(id);
        if (detailFactureRepository.existsByIdActe(id)) {
            throw new BusinessException("Impossible de supprimer un acte utilisé dans des factures");
        }
        acteMedicalRepository.delete(acte);
    }

    private ActeMedical getActe(Integer id) {
        return acteMedicalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acte médical non trouvé avec l'id : " + id));
    }

    private void updateEntity(ActeMedical acte, ActeMedicalRequestDto dto) {
        acte.setCodeActe(dto.getCodeActe());
        acte.setLibelle(dto.getLibelle());
        acte.setDescription(dto.getDescription());
        acte.setPrixBase(dto.getPrixBase() != null ? BigDecimal.valueOf(dto.getPrixBase()) : null);
        acte.setCategorie(dto.getCategorie());
        acte.setCoefficient(dto.getCoefficient() != null ? BigDecimal.valueOf(dto.getCoefficient()) : BigDecimal.ONE);
        acte.setLettreCle(dto.getLettreCle());
        acte.setRemboursable(dto.getRemboursable() != null ? dto.getRemboursable() : true);
        acte.setTauxRemboursement(dto.getTauxRemboursement() != null ? dto.getTauxRemboursement() : 70);
        acte.setActif(dto.getActif() != null ? dto.getActif() : true);
    }

    private ActeMedicalResponseDto toResponseDto(ActeMedical acte) {
        return ActeMedicalResponseDto.builder()
                .idActe(acte.getIdActe())
                .codeActe(acte.getCodeActe())
                .libelle(acte.getLibelle())
                .description(acte.getDescription())
                .prixBase(acte.getPrixBase() != null ? acte.getPrixBase().doubleValue() : null)
                .categorie(acte.getCategorie())
                .coefficient(acte.getCoefficient() != null ? acte.getCoefficient().doubleValue() : null)
                .lettreCle(acte.getLettreCle())
                .remboursable(acte.getRemboursable())
                .tauxRemboursement(acte.getTauxRemboursement())
                .actif(acte.getActif())
                .build();
    }
}
