package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.ActeCatalogue;
import adc.gestion_hospitaliere.Entity.GroupeActe;
import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import adc.gestion_hospitaliere.Repository.ActeCatalogueRepository;
import adc.gestion_hospitaliere.Repository.GroupeActeRepository;
import adc.gestion_hospitaliere.dto.catalogue.ActeCatalogueRequestDto;
import adc.gestion_hospitaliere.dto.catalogue.ActeCatalogueResponseDto;
import adc.gestion_hospitaliere.dto.catalogue.GroupeActeRequestDto;
import adc.gestion_hospitaliere.dto.catalogue.GroupeActeResponseDto;
import adc.gestion_hospitaliere.exception.BusinessException;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActeCatalogueService {

    private final ActeCatalogueRepository catalogueRepository;
    private final GroupeActeRepository groupeRepository;

    // ---------- GROUPES ----------

    public List<GroupeActeResponseDto> getGroupes(CategorieActeMedical categorie) {
        return groupeRepository.findByCategorieAndActifTrueOrderByLibelle(categorie)
                .stream().map(this::toGroupeDto).collect(Collectors.toList());
    }

    public List<GroupeActeResponseDto> listerGroupes(CategorieActeMedical categorie) {
        List<GroupeActe> groupes = categorie != null
                ? groupeRepository.findByCategorieOrderByLibelle(categorie)
                : groupeRepository.findAllByOrderByCategorieAscLibelleAsc();
        return groupes.stream().map(this::toGroupeDto).collect(Collectors.toList());
    }

    @Transactional
    public GroupeActeResponseDto createGroupe(GroupeActeRequestDto dto) {
        if (groupeRepository.existsByLibelleAndCategorie(dto.getLibelle().trim(), dto.getCategorie())) {
            throw new BusinessException("Un groupe avec ce libellé existe déjà pour cette catégorie");
        }
        GroupeActe groupe = GroupeActe.builder()
                .libelle(dto.getLibelle().trim())
                .categorie(dto.getCategorie())
                .description(dto.getDescription())
                .actif(dto.getActif() != null ? dto.getActif() : true)
                .build();
        return toGroupeDto(groupeRepository.save(groupe));
    }

    @Transactional
    public GroupeActeResponseDto updateGroupe(Integer id, GroupeActeRequestDto dto) {
        GroupeActe groupe = groupeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable"));
        if (dto.getLibelle() != null && !dto.getLibelle().isBlank()) {
            groupe.setLibelle(dto.getLibelle().trim());
        }
        if (dto.getCategorie() != null) groupe.setCategorie(dto.getCategorie());
        if (dto.getDescription() != null) groupe.setDescription(dto.getDescription());
        if (dto.getActif() != null) groupe.setActif(dto.getActif());
        return toGroupeDto(groupeRepository.save(groupe));
    }

    @Transactional
    public void deleteGroupe(Integer id) {
        GroupeActe groupe = groupeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable"));
        if (!catalogueRepository.findByIdGroupe(id).isEmpty()) {
            throw new BusinessException("Impossible de supprimer un groupe contenant des actes");
        }
        groupeRepository.delete(groupe);
    }

    // ---------- ACTES ----------

    public List<ActeCatalogueResponseDto> search(CategorieActeMedical categorie, Integer idGroupe, String search) {
        return searchInterne(categorie, idGroupe, search, false);
    }

    public List<ActeCatalogueResponseDto> searchAdmin(CategorieActeMedical categorie, Integer idGroupe, String search) {
        return searchInterne(categorie, idGroupe, search, true);
    }

    private List<ActeCatalogueResponseDto> searchInterne(CategorieActeMedical categorie, Integer idGroupe,
                                                        String search, boolean inclureInactifs) {
        String normalizedSearch = normalize(search);
        return catalogueRepository.findAllByOrderByLibelleAsc().stream()
                .filter(a -> inclureInactifs || Boolean.TRUE.equals(a.getActif()))
                .filter(a -> categorie == null || (a.getGroupe() != null && a.getGroupe().getCategorie() == categorie))
                .filter(a -> idGroupe == null || idGroupe.equals(a.getIdGroupe()))
                .filter(a -> {
                    if (normalizedSearch == null || normalizedSearch.isEmpty()) return true;
                    boolean okLibelle = normalize(a.getLibelle()).contains(normalizedSearch);
                    boolean okCode = normalize(a.getCode()).contains(normalizedSearch);
                    boolean okGroupe = a.getGroupe() != null && normalize(a.getGroupe().getLibelle()).contains(normalizedSearch);
                    return okLibelle || okCode || okGroupe;
                })
                .sorted(Comparator.comparing(ActeCatalogue::getLibelle, String.CASE_INSENSITIVE_ORDER))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ActeCatalogueResponseDto createActe(ActeCatalogueRequestDto dto) {
        String code = dto.getCode().trim();
        if (catalogueRepository.existsByCode(code)) {
            throw new BusinessException("Un acte avec ce code existe déjà");
        }
        GroupeActe groupe = groupeRepository.findById(dto.getIdGroupe())
                .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable"));
        ActeCatalogue acte = ActeCatalogue.builder()
                .code(code)
                .libelle(dto.getLibelle().trim())
                .idGroupe(groupe.getIdGroupe())
                .prixDefaut(dto.getPrixDefaut() != null ? dto.getPrixDefaut() : BigDecimal.ZERO)
                .coefficient(dto.getCoefficient())
                .lettreCle(dto.getLettreCle())
                .remboursable(dto.getRemboursable() != null ? dto.getRemboursable() : true)
                .tauxRemboursement(dto.getTauxRemboursement())
                .description(dto.getDescription())
                .actif(dto.getActif() != null ? dto.getActif() : true)
                .build();
        return toDto(catalogueRepository.save(acte));
    }

    @Transactional
    public ActeCatalogueResponseDto updateActe(Integer id, ActeCatalogueRequestDto dto) {
        ActeCatalogue acte = catalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acte introuvable"));
        if (dto.getCode() != null && !dto.getCode().isBlank()) {
            String code = dto.getCode().trim();
            if (catalogueRepository.existsByCodeAndIdActeCatalogueNot(code, id)) {
                throw new BusinessException("Un acte avec ce code existe déjà");
            }
            acte.setCode(code);
        }
        if (dto.getLibelle() != null && !dto.getLibelle().isBlank()) acte.setLibelle(dto.getLibelle().trim());
        if (dto.getIdGroupe() != null) {
            groupeRepository.findById(dto.getIdGroupe())
                    .orElseThrow(() -> new ResourceNotFoundException("Groupe introuvable"));
            acte.setIdGroupe(dto.getIdGroupe());
        }
        if (dto.getPrixDefaut() != null) acte.setPrixDefaut(dto.getPrixDefaut());
        if (dto.getCoefficient() != null) acte.setCoefficient(dto.getCoefficient());
        if (dto.getLettreCle() != null) acte.setLettreCle(dto.getLettreCle());
        if (dto.getRemboursable() != null) acte.setRemboursable(dto.getRemboursable());
        if (dto.getTauxRemboursement() != null) acte.setTauxRemboursement(dto.getTauxRemboursement());
        if (dto.getDescription() != null) acte.setDescription(dto.getDescription());
        if (dto.getActif() != null) acte.setActif(dto.getActif());
        return toDto(catalogueRepository.save(acte));
    }

    @Transactional
    public void deleteActe(Integer id) {
        ActeCatalogue acte = catalogueRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Acte introuvable"));
        catalogueRepository.delete(acte);
    }

    // ---------- MAPPING ----------

    private String normalize(String value) {
        if (value == null) return "";
        String noAccents = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "");
        return noAccents.toLowerCase();
    }

    private ActeCatalogueResponseDto toDto(ActeCatalogue a) {
        GroupeActe groupe = a.getGroupe();
        return ActeCatalogueResponseDto.builder()
                .idActeCatalogue(a.getIdActeCatalogue())
                .code(a.getCode())
                .libelle(a.getLibelle())
                .idGroupe(a.getIdGroupe())
                .groupeLibelle(groupe != null ? groupe.getLibelle() : null)
                .categorie(groupe != null ? groupe.getCategorie() : null)
                .prixDefaut(a.getPrixDefaut())
                .coefficient(a.getCoefficient())
                .lettreCle(a.getLettreCle())
                .remboursable(a.getRemboursable())
                .tauxRemboursement(a.getTauxRemboursement())
                .description(a.getDescription())
                .actif(a.getActif())
                .dateCreation(a.getDateCreation())
                .build();
    }

    private GroupeActeResponseDto toGroupeDto(GroupeActe g) {
        return GroupeActeResponseDto.builder()
                .idGroupe(g.getIdGroupe())
                .libelle(g.getLibelle())
                .categorie(g.getCategorie())
                .description(g.getDescription())
                .actif(g.getActif())
                .build();
    }
}
