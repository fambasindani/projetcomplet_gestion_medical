package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.FournisseurPharma;
import adc.gestion_hospitaliere.Repository.FournisseurPharmaRepository;
import adc.gestion_hospitaliere.dto.fournisseur.FournisseurRequestDto;
import adc.gestion_hospitaliere.dto.fournisseur.FournisseurResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FournisseurService {

    private final FournisseurPharmaRepository repository;

    public Page<FournisseurResponseDto> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<FournisseurResponseDto> search(String nom, Pageable pageable) {
        return repository.findByNomFournisseurContainingIgnoreCase(nom, pageable).map(this::toResponseDto);
    }

    public FournisseurResponseDto getById(Integer id) {
        FournisseurPharma f = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));
        return toResponseDto(f);
    }

    @Transactional
    public FournisseurResponseDto create(FournisseurRequestDto dto) {
        if (repository.existsByNomFournisseurIgnoreCase(dto.getNomFournisseur())) {
            throw new BusinessException("Un fournisseur avec ce nom existe déjà");
        }
        FournisseurPharma f = new FournisseurPharma();
        updateEntity(f, dto);
        f = repository.save(f);
        return toResponseDto(f);
    }

    @Transactional
    public FournisseurResponseDto update(Integer id, FournisseurRequestDto dto) {
        FournisseurPharma f = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));
        if (repository.existsByNomFournisseurIgnoreCaseAndIdFournisseurNot(dto.getNomFournisseur(), id)) {
            throw new BusinessException("Un autre fournisseur avec ce nom existe déjà");
        }
        updateEntity(f, dto);
        f = repository.save(f);
        return toResponseDto(f);
    }

    @Transactional
    public void delete(Integer id) {
        FournisseurPharma f = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));
        // Vérifier si des lots ou commandes existent
        if (f.getLots() != null && !f.getLots().isEmpty()) {
            throw new BusinessException("Impossible de supprimer un fournisseur associé à des lots");
        }
        if (f.getCommandes() != null && !f.getCommandes().isEmpty()) {
            throw new BusinessException("Impossible de supprimer un fournisseur associé à des commandes");
        }
        repository.delete(f);
    }

    private void updateEntity(FournisseurPharma f, FournisseurRequestDto dto) {
        f.setNomFournisseur(dto.getNomFournisseur());
        f.setContactNom(dto.getContactNom());
        f.setContactFonction(dto.getContactFonction());
        f.setTelephone(dto.getTelephone());
        f.setEmail(dto.getEmail());
        f.setAdresse(dto.getAdresse());
        f.setSiteWeb(dto.getSiteWeb());
        f.setSiret(dto.getSiret());
        f.setNumeroAgrement(dto.getNumeroAgrement());
        f.setConditionsPaiement(dto.getConditionsPaiement());
        f.setDelaiLivraison(dto.getDelaiLivraison());
        f.setNote(dto.getNote());
        f.setActif(dto.getActif() != null ? dto.getActif() : true);
    }


    public Page<FournisseurResponseDto> search(String nom, Boolean actif, Pageable pageable) {
        if (nom != null && actif != null) {
            return repository.findByNomFournisseurContainingIgnoreCaseAndActif(nom, actif, pageable).map(this::toResponseDto);
        } else if (nom != null) {
            return repository.findByNomFournisseurContainingIgnoreCase(nom, pageable).map(this::toResponseDto);
        } else if (actif != null) {
            return repository.findByActif(actif, pageable).map(this::toResponseDto);
        } else {
            return repository.findAll(pageable).map(this::toResponseDto);
        }
    }

    private FournisseurResponseDto toResponseDto(FournisseurPharma f) {
        return FournisseurResponseDto.builder()
                .idFournisseur(f.getIdFournisseur())
                .nomFournisseur(f.getNomFournisseur())
                .contactNom(f.getContactNom())
                .contactFonction(f.getContactFonction())
                .telephone(f.getTelephone())
                .email(f.getEmail())
                .adresse(f.getAdresse())
                .siteWeb(f.getSiteWeb())
                .siret(f.getSiret())
                .numeroAgrement(f.getNumeroAgrement())
                .conditionsPaiement(f.getConditionsPaiement())
                .delaiLivraison(f.getDelaiLivraison())
                .note(f.getNote())
                .actif(f.getActif())
                .build();
    }
}