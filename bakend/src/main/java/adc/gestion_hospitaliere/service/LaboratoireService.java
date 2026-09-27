package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Laboratoire;
import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Entity.PersonnelLaboratoire;
import adc.gestion_hospitaliere.Repository.LaboratoireRepository;
import adc.gestion_hospitaliere.Repository.PersonnelLaboratoireRepository;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.dto.laboratoire.*;
import adc.gestion_hospitaliere.exception.BusinessException;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LaboratoireService {

    private final LaboratoireRepository laboratoireRepository;
    private final PersonnelLaboratoireRepository personnelLaboratoireRepository;
    private final PersonnelRepository personnelRepository;

    @Transactional(readOnly = true)
    public List<LaboratoireResponseDto> findAll(boolean actifsSeulement) {
        List<Laboratoire> labs = actifsSeulement
                ? laboratoireRepository.findByActifTrueOrderByNomAsc()
                : laboratoireRepository.findAll();
        return labs.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<LaboratoireResponseDto> search(
            Boolean actif, String term, org.springframework.data.domain.Pageable pageable) {
        String t = (term == null || term.isBlank()) ? null : term.trim();
        return laboratoireRepository.search(actif, t, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public LaboratoireResponseDto findById(Integer id) {
        Laboratoire lab = laboratoireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratoire introuvable : " + id));
        return toDto(lab);
    }

    @Transactional
    public LaboratoireResponseDto create(LaboratoireRequestDto dto) {
        if (laboratoireRepository.existsByNomIgnoreCase(dto.getNom())) {
            throw new BusinessException("Un laboratoire porte déjà ce nom");
        }
        Laboratoire lab = Laboratoire.builder()
                .nom(dto.getNom())
                .type(dto.getType())
                .responsable(dto.getResponsable())
                .accreditation(dto.getAccreditation())
                .actif(dto.getActif() == null ? true : dto.getActif())
                .build();
        laboratoireRepository.save(lab);
        return toDto(lab);
    }

    @Transactional
    public LaboratoireResponseDto update(Integer id, LaboratoireRequestDto dto) {
        Laboratoire lab = laboratoireRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Laboratoire introuvable : " + id));
        lab.setNom(dto.getNom());
        lab.setType(dto.getType());
        lab.setResponsable(dto.getResponsable());
        lab.setAccreditation(dto.getAccreditation());
        if (dto.getActif() != null) lab.setActif(dto.getActif());
        laboratoireRepository.save(lab);
        return toDto(lab);
    }

    @Transactional
    public void delete(Integer id) {
        if (!laboratoireRepository.existsById(id)) {
            throw new ResourceNotFoundException("Laboratoire introuvable : " + id);
        }
        personnelLaboratoireRepository.findByIdLaboratoire(id)
                .forEach(personnelLaboratoireRepository::delete);
        laboratoireRepository.deleteById(id);
    }

    /** Affecte un technicien/laborantin à un laboratoire (remplace son affectation). */
    @Transactional
    public LaboratoireResponseDto affecter(AffectationLaboratoireDto dto) {
        laboratoireRepository.findById(dto.getIdLaboratoire())
                .orElseThrow(() -> new ResourceNotFoundException("Laboratoire introuvable"));
        personnelRepository.findById(dto.getIdPersonnel())
                .orElseThrow(() -> new ResourceNotFoundException("Personnel introuvable"));
        personnelLaboratoireRepository.deleteByIdPersonnel(dto.getIdPersonnel());
        personnelLaboratoireRepository.save(PersonnelLaboratoire.builder()
                .idPersonnel(dto.getIdPersonnel())
                .idLaboratoire(dto.getIdLaboratoire())
                .build());
        return findById(dto.getIdLaboratoire());
    }

    @Transactional
    public void retirerAffectation(Integer idPersonnel) {
        personnelLaboratoireRepository.deleteByIdPersonnel(idPersonnel);
    }

    private LaboratoireResponseDto toDto(Laboratoire lab) {
        List<PersonnelLaboratoire> liens = personnelLaboratoireRepository.findByIdLaboratoire(lab.getIdLaboratoire());
        List<Integer> ids = liens.stream().map(PersonnelLaboratoire::getIdPersonnel).collect(Collectors.toList());
        Map<Integer, Personnel> personnes = ids.isEmpty() ? Map.of()
                : personnelRepository.findAllById(ids).stream()
                    .collect(Collectors.toMap(Personnel::getIdPersonnel, Function.identity()));
        List<PersonnelAffecteDto> personnel = liens.stream()
                .map(l -> personnes.get(l.getIdPersonnel()))
                .filter(java.util.Objects::nonNull)
                .map(p -> new PersonnelAffecteDto(p.getIdPersonnel(),
                        (p.getPrenom() == null ? "" : p.getPrenom() + " ") + (p.getNom() == null ? "" : p.getNom()),
                        p.getFonction()))
                .collect(Collectors.toList());
        return LaboratoireResponseDto.builder()
                .idLaboratoire(lab.getIdLaboratoire())
                .nom(lab.getNom())
                .type(lab.getType())
                .responsable(lab.getResponsable())
                .accreditation(lab.getAccreditation())
                .actif(lab.getActif())
                .dateCreation(lab.getDateCreation())
                .personnel(personnel)
                .build();
    }
}