package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.AlerteStock;
import adc.gestion_hospitaliere.Entity.LotMedicament;
import adc.gestion_hospitaliere.Entity.Medicament;
import adc.gestion_hospitaliere.Enums.StatutLot;
import adc.gestion_hospitaliere.Enums.TypeAlerteStock;
import adc.gestion_hospitaliere.Repository.AlerteStockRepository;
import adc.gestion_hospitaliere.Repository.LotMedicamentRepository;
import adc.gestion_hospitaliere.Repository.MedicamentRepository;
import adc.gestion_hospitaliere.Repository.FournisseurPharmaRepository;
import adc.gestion_hospitaliere.dto.lot.LotRequestDto;
import adc.gestion_hospitaliere.dto.lot.LotResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LotMedicamentService {

    private final LotMedicamentRepository repository;
    private final MedicamentRepository medicamentRepository;
    private final FournisseurPharmaRepository fournisseurRepository;
    private final AlerteStockRepository alerteStockRepository;

    // ---------- CRUD ----------

    public Page<LotResponseDto> getAll(Pageable pageable) {
        return repository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<LotResponseDto> search(Integer idMedicament, String numeroLot, StatutLot statut, Pageable pageable) {
        return repository.search(idMedicament, numeroLot, statut, pageable).map(this::toResponseDto);
    }

    public LotResponseDto getById(Integer id) {
        LotMedicament lot = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot non trouvé"));
        return toResponseDto(lot);
    }

    @Transactional
    public LotResponseDto create(LotRequestDto dto) {
        medicamentRepository.findById(dto.getIdMedicament())
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé"));
        if (dto.getIdFournisseur() != null) {
            fournisseurRepository.findById(dto.getIdFournisseur())
                    .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));
        }
        LotMedicament lot = new LotMedicament();
        updateEntity(lot, dto);
        lot = repository.save(lot);
        verifierAlertesPourMedicament(dto.getIdMedicament());
        return toResponseDto(lot);
    }

    @Transactional
    public LotResponseDto update(Integer id, LotRequestDto dto) {
        LotMedicament lot = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot non trouvé"));
        updateEntity(lot, dto);
        lot = repository.save(lot);
        verifierAlertesPourMedicament(lot.getIdMedicament());
        return toResponseDto(lot);
    }

    @Transactional
    public void delete(Integer id) {
        LotMedicament lot = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lot non trouvé"));
        if (lot.getPrescriptions() != null && !lot.getPrescriptions().isEmpty()) {
            throw new BusinessException("Impossible de supprimer un lot associé à des prescriptions");
        }
        Integer idMedicament = lot.getIdMedicament();
        repository.delete(lot);
        verifierAlertesPourMedicament(idMedicament);
    }

    // ---------- GESTION DES ALERTES ----------

    /**
     * Vérifie les alertes pour un médicament spécifique (stocks, péremption)
     */
    @Transactional
    public void verifierAlertesPourMedicament(Integer idMedicament) {
        Medicament medicament = medicamentRepository.findById(idMedicament)
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé"));

        Integer stockMin = medicament.getStockMinimum();
        Integer stockActuel = calculerStockActuel(idMedicament);

        // 1. Vérifier le stock minimum
        if (stockMin != null && stockMin > 0) {
            if (stockActuel < stockMin) {
                TypeAlerteStock type = (stockActuel < stockMin / 2) ? TypeAlerteStock.STOCK_CRITIQUE : TypeAlerteStock.STOCK_FAIBLE;
                creerAlerteSiNonExistante(medicament, type, stockActuel, stockMin, null);
            } else {
                desactiverAlertes(medicament.getIdMedicament(), TypeAlerteStock.STOCK_FAIBLE, TypeAlerteStock.STOCK_CRITIQUE);
            }
        }

        // 2. Vérifier les péremptions des lots de ce médicament
        List<LotMedicament> lots = repository.findByIdMedicament(idMedicament);
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime seuilPeremption = now.plusDays(30);

        boolean hasPeremptionProchaine = false;
        boolean hasPeremptionDepassee = false;

        for (LotMedicament lot : lots) {
            if (lot.getDatePeremption() != null) {
                if (lot.getDatePeremption().isBefore(now)) {
                    hasPeremptionDepassee = true;
                } else if (lot.getDatePeremption().isBefore(seuilPeremption)) {
                    hasPeremptionProchaine = true;
                }
            }
        }

        if (hasPeremptionDepassee) {
            creerAlerteSiNonExistante(medicament, TypeAlerteStock.PEREMPTION_DEPASSEE, null, null, null);
        } else {
            desactiverAlertes(medicament.getIdMedicament(), TypeAlerteStock.PEREMPTION_DEPASSEE);
        }

        if (hasPeremptionProchaine) {
            creerAlerteSiNonExistante(medicament, TypeAlerteStock.PEREMPTION_PROCHAINE, null, null, null);
        } else {
            desactiverAlertes(medicament.getIdMedicament(), TypeAlerteStock.PEREMPTION_PROCHAINE);
        }
    }

    /**
     * Calcule le stock actuel d'un médicament à partir de ses lots.
     */
    private int calculerStockActuel(Integer idMedicament) {
        List<LotMedicament> lots = repository.findByIdMedicament(idMedicament);
        return lots.stream()
                .filter(lot -> lot.getStatut() != StatutLot.Périmé)
                .mapToInt(LotMedicament::getQuantiteRestante)
                .sum();
    }

    /**
     * Crée une alerte uniquement si aucune alerte non traitée du même type n'existe déjà.
     */
    private void creerAlerteSiNonExistante(Medicament medicament, TypeAlerteStock type,
                                           Integer stockActuel, Integer stockMin, LocalDateTime datePeremption) {
        boolean existe = alerteStockRepository.findByIdMedicament(medicament.getIdMedicament())
                .stream()
                .anyMatch(a -> a.getTypeAlerte() == type && !a.getTraitee());

        if (!existe) {
            AlerteStock alerte = AlerteStock.builder()
                    .idMedicament(medicament.getIdMedicament())
                    .typeAlerte(type)
                    .seuilActuel(stockActuel)
                    .seuilMinimum(stockMin)
                    .datePeremption(datePeremption)
                    .traitee(false)
                    .build();
            alerteStockRepository.save(alerte);
        }
    }

    /**
     * Désactive (marque comme traitées) les alertes non traitées d'un type donné pour un médicament.
     */
    private void desactiverAlertes(Integer idMedicament, TypeAlerteStock... types) {
        List<AlerteStock> alertes = alerteStockRepository.findByIdMedicament(idMedicament);
        for (AlerteStock alerte : alertes) {
            if (!alerte.getTraitee()) {
                for (TypeAlerteStock type : types) {
                    if (alerte.getTypeAlerte() == type) {
                        alerte.setTraitee(true);
                        alerte.setDateTraitement(LocalDateTime.now());
                        alerte.setActionEntreprise("Alerte automatiquement résolue");
                        alerteStockRepository.save(alerte);
                    }
                }
            }
        }
    }

    /**
     * Vérification automatique toutes les heures (planifiée).
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void schedulerVerifierToutesAlertes() {
        List<Medicament> medicaments = medicamentRepository.findAll();
        for (Medicament med : medicaments) {
            verifierAlertesPourMedicament(med.getIdMedicament());
        }
    }

    // ---------- MAPPING ----------

    private void updateEntity(LotMedicament lot, LotRequestDto dto) {
        lot.setIdMedicament(dto.getIdMedicament());
        lot.setNumeroLot(dto.getNumeroLot());
        lot.setIdFournisseur(dto.getIdFournisseur());
        lot.setDateFabrication(dto.getDateFabrication());
        lot.setDatePeremption(dto.getDatePeremption());
        lot.setQuantiteInitial(dto.getQuantiteInitial());
        lot.setQuantiteRestante(dto.getQuantiteRestante() != null ? dto.getQuantiteRestante() : dto.getQuantiteInitial());
        lot.setPrixAchatUnitaire(dto.getPrixAchatUnitaire());
        lot.setPrixVenteUnitaire(dto.getPrixVenteUnitaire());
        lot.setEmplacementStockage(dto.getEmplacementStockage());
        lot.setDateReception(dto.getDateReception());
        lot.setBonCommande(dto.getBonCommande());
        lot.setFactureFournisseur(dto.getFactureFournisseur());
        lot.setControleQualite(dto.getControleQualite() != null ? dto.getControleQualite() : false);
        lot.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutLot.Disponible);
        lot.setNotes(dto.getNotes());
    }

    private LotResponseDto toResponseDto(LotMedicament lot) {
        String medicamentNom = lot.getMedicament() != null
                ? lot.getMedicament().getNomCommercial()
                : null;
        String fournisseurNom = lot.getFournisseur() != null
                ? lot.getFournisseur().getNomFournisseur()
                : null;
        return LotResponseDto.builder()
                .idLot(lot.getIdLot())
                .idMedicament(lot.getIdMedicament())
                .medicamentNom(medicamentNom)
                .numeroLot(lot.getNumeroLot())
                .idFournisseur(lot.getIdFournisseur())
                .fournisseurNom(fournisseurNom)
                .dateFabrication(lot.getDateFabrication())
                .datePeremption(lot.getDatePeremption())
                .quantiteInitial(lot.getQuantiteInitial())
                .quantiteRestante(lot.getQuantiteRestante())
                .prixAchatUnitaire(lot.getPrixAchatUnitaire())
                .prixVenteUnitaire(lot.getPrixVenteUnitaire())
                .emplacementStockage(lot.getEmplacementStockage())
                .dateReception(lot.getDateReception())
                .bonCommande(lot.getBonCommande())
                .factureFournisseur(lot.getFactureFournisseur())
                .controleQualite(lot.getControleQualite())
                .statut(lot.getStatut())
                .notes(lot.getNotes())
                .build();
    }
}