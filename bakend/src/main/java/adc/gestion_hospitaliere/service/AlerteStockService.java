package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;


import adc.gestion_hospitaliere.Entity.AlerteStock;
import adc.gestion_hospitaliere.Entity.LotMedicament;
import adc.gestion_hospitaliere.Entity.Medicament;
import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Enums.StatutLot;
import adc.gestion_hospitaliere.Enums.TypeAlerteStock;
import adc.gestion_hospitaliere.Repository.AlerteStockRepository;
import adc.gestion_hospitaliere.Repository.LotMedicamentRepository;
import adc.gestion_hospitaliere.Repository.MedicamentRepository;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.dto.Alerte.AlerteStockRequestDto;
import adc.gestion_hospitaliere.dto.Alerte.AlerteStockResponseDto;
import adc.gestion_hospitaliere.dto.Alerte.AlerteStockUpdateDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AlerteStockService {

    private final AlerteStockRepository alerteRepository;
    private final MedicamentRepository medicamentRepository;
    private final LotMedicamentRepository lotMedicamentRepository;
    private final PersonnelRepository personnelRepository;
    private final NotificationService notificationService;

    // ---------- CRUD ----------

    public Page<AlerteStockResponseDto> getAll(Pageable pageable) {
        return alerteRepository.findAll(pageable).map(this::toDto);
    }

    // ✅ Correction : utilisation de findByTraitee(false, pageable)
    public Page<AlerteStockResponseDto> getNonTraitees(Pageable pageable) {
        return alerteRepository.findByTraitee(false, pageable).map(this::toDto);
    }



    // Dans AlerteStockService.java
    @Transactional
    public AlerteStockResponseDto traiterAlerte(Integer id, AlerteStockUpdateDto dto) {
        AlerteStock alerte = alerteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte non trouvée"));
        alerte.setTraitee(true);
        alerte.setDateTraitement(LocalDateTime.now());
        if (dto.getTraiteePar() != null) {
            alerte.setTraiteePar(dto.getTraiteePar());
        }
        if (dto.getActionEntreprise() != null) {
            alerte.setActionEntreprise(dto.getActionEntreprise());
        }
        return toDto(alerteRepository.save(alerte));
    }
    public Page<AlerteStockResponseDto> search(TypeAlerteStock type, Boolean traitee, Integer idMedicament,
                                               LocalDateTime start, LocalDateTime end, Pageable pageable) {
        return alerteRepository.search(type, traitee, idMedicament, start, end, pageable).map(this::toDto);
    }

    public AlerteStockResponseDto getById(Integer id) {
        return toDto(alerteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte non trouvée")));
    }

    @Transactional
    public AlerteStockResponseDto create(AlerteStockRequestDto dto) {
        Medicament med = medicamentRepository.findById(dto.getIdMedicament())
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé"));

        AlerteStock alerte = AlerteStock.builder()
                .idMedicament(dto.getIdMedicament())
                .typeAlerte(dto.getTypeAlerte())
                .seuilActuel(dto.getSeuilActuel())
                .seuilMinimum(dto.getSeuilMinimum())
                .datePeremption(dto.getDatePeremption())
                .traitee(dto.getTraitee() != null && dto.getTraitee())
                .actionEntreprise(dto.getActionEntreprise())
                .build();
        if (dto.getTraitee() != null && dto.getTraitee()) {
            alerte.setDateTraitement(LocalDateTime.now());
            alerte.setTraiteePar(dto.getTraiteePar());
        }
        return toDto(alerteRepository.save(alerte));
    }

    @Transactional
    public AlerteStockResponseDto update(Integer id, AlerteStockRequestDto dto) {
        AlerteStock alerte = alerteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alerte non trouvée"));

        if (dto.getIdMedicament() != null) alerte.setIdMedicament(dto.getIdMedicament());
        if (dto.getTypeAlerte() != null) alerte.setTypeAlerte(dto.getTypeAlerte());
        if (dto.getSeuilActuel() != null) alerte.setSeuilActuel(dto.getSeuilActuel());
        if (dto.getSeuilMinimum() != null) alerte.setSeuilMinimum(dto.getSeuilMinimum());
        if (dto.getDatePeremption() != null) alerte.setDatePeremption(dto.getDatePeremption());
        if (dto.getActionEntreprise() != null) alerte.setActionEntreprise(dto.getActionEntreprise());

        if (dto.getTraitee() != null && dto.getTraitee() && !alerte.getTraitee()) {
            alerte.setTraitee(true);
            alerte.setDateTraitement(LocalDateTime.now());
            alerte.setTraiteePar(dto.getTraiteePar());
        }
        return toDto(alerteRepository.save(alerte));
    }

    @Transactional
    public void delete(Integer id) {
        alerteRepository.deleteById(id);
    }

    // ---------- GÉNÉRATION AUTOMATIQUE DES ALERTES ----------

    @Scheduled(cron = "0 0 * * * *") // toutes les heures
    @Transactional
    public void verifierEtGenererAlertes() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime alertePeremption = now.plusDays(30);

        List<Medicament> medicaments = medicamentRepository.findAll();

        for (Medicament med : medicaments) {
            Integer stockMin = med.getStockMinimum();
            if (stockMin != null && stockMin > 0) {
                int stockActuel = calculerStockActuel(med.getIdMedicament());
                if (stockActuel < stockMin) {
                    TypeAlerteStock type = stockActuel < (stockMin / 2)
                            ? TypeAlerteStock.STOCK_CRITIQUE
                            : TypeAlerteStock.STOCK_FAIBLE;
                    creerAlerteSiAbsente(med.getIdMedicament(), type, stockActuel, stockMin, null);
                }
            }

            List<LotMedicament> lots = lotMedicamentRepository.findByIdMedicament(med.getIdMedicament());
            for (LotMedicament lot : lots) {
                if (lot.getDatePeremption() != null) {
                    if (lot.getDatePeremption().isBefore(now)) {
                        creerAlerteSiAbsente(med.getIdMedicament(), TypeAlerteStock.PEREMPTION_DEPASSEE,
                                null, null, lot.getDatePeremption());
                    } else if (lot.getDatePeremption().isBefore(alertePeremption)) {
                        creerAlerteSiAbsente(med.getIdMedicament(), TypeAlerteStock.PEREMPTION_PROCHAINE,
                                null, null, lot.getDatePeremption());
                    }
                }
            }
        }
    }

    private int calculerStockActuel(Integer idMedicament) {
        List<LotMedicament> lots = lotMedicamentRepository.findByIdMedicament(idMedicament);
        return lots.stream()
                .filter(lot -> lot.getStatut() != StatutLot.Périmé)
                .mapToInt(LotMedicament::getQuantiteRestante)
                .sum();
    }

    private void creerAlerteSiAbsente(Integer idMedicament, TypeAlerteStock type,
                                      Integer stockActuel, Integer stockMin, LocalDateTime datePeremption) {
        List<AlerteStock> existantes = alerteRepository.findByIdMedicament(idMedicament);
        boolean existe = existantes.stream()
                .anyMatch(a -> a.getTypeAlerte() == type && !a.getTraitee());

        if (!existe) {
            AlerteStock alerte = AlerteStock.builder()
                    .idMedicament(idMedicament)
                    .typeAlerte(type)
                    .seuilActuel(stockActuel)
                    .seuilMinimum(stockMin)
                    .datePeremption(datePeremption)
                    .traitee(false)
                    .build();
            alerte = alerteRepository.save(alerte);

            String medNom = medicamentRepository.findById(idMedicament)
                    .map(Medicament::getNomCommercial)
                    .orElse("Médicament");
            switch (type) {
                case STOCK_CRITIQUE -> notificationService.notifier(
                        adc.gestion_hospitaliere.Enums.TypeNotification.STOCK_CRITIQUE,
                        "Stock critique",
                        "Le stock de « " + medNom + " » est critique (" + stockActuel + " restant, minimum " + stockMin + ").",
                        "MEDICAMENT", idMedicament);
                case STOCK_FAIBLE -> notificationService.notifier(
                        adc.gestion_hospitaliere.Enums.TypeNotification.STOCK_FAIBLE,
                        "Stock faible",
                        "Le stock de « " + medNom + " » est faible (" + stockActuel + " restant, minimum " + stockMin + ").",
                        "MEDICAMENT", idMedicament);
                case PEREMPTION_PROCHAINE -> notificationService.notifier(
                        adc.gestion_hospitaliere.Enums.TypeNotification.PEREMPTION_PROCHAINE,
                        "Péremption prochaine",
                        "Un lot de « " + medNom + " » expire bientôt (" + (datePeremption != null ? datePeremption.toLocalDate() : "?") + ").",
                        "MEDICAMENT", idMedicament);
                case PEREMPTION_DEPASSEE -> notificationService.notifier(
                        adc.gestion_hospitaliere.Enums.TypeNotification.PEREMPTION_DEPASSEE,
                        "Lot périmé",
                        "Un lot de « " + medNom + " » est périmé depuis le " + (datePeremption != null ? datePeremption.toLocalDate() : "?") + ".",
                        "MEDICAMENT", idMedicament);
                default -> { }
            }
        }
    }

    @Transactional
    public void genererAlertesManuellement() {
        verifierEtGenererAlertes();
    }

    // ---------- CONVERSION ----------

    private AlerteStockResponseDto toDto(AlerteStock alerte) {
        String medicamentNom = medicamentRepository.findById(alerte.getIdMedicament())
                .map(Medicament::getNomCommercial)
                .orElse(null);
        String traiteurNom = null;
        if (alerte.getTraiteePar() != null) {
            traiteurNom = personnelRepository.findById(alerte.getTraiteePar())
                    .map(Personnel::getNom)
                    .orElse(null);
        }
        return AlerteStockResponseDto.builder()
                .idAlerte(alerte.getIdAlerte())
                .idMedicament(alerte.getIdMedicament())
                .medicamentNom(medicamentNom)
                .typeAlerte(alerte.getTypeAlerte())
                .seuilActuel(alerte.getSeuilActuel())
                .seuilMinimum(alerte.getSeuilMinimum())
                .datePeremption(alerte.getDatePeremption())
                .dateAlerte(alerte.getDateAlerte())
                .traitee(alerte.getTraitee())
                .dateTraitement(alerte.getDateTraitement())
                .traiteePar(alerte.getTraiteePar())
                .traiteurNom(traiteurNom)
                .actionEntreprise(alerte.getActionEntreprise())
                .build();
    }
}