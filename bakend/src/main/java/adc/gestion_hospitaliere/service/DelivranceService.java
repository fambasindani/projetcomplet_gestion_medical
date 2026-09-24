package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.*;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.delivrance.*;
import adc.gestion_hospitaliere.dto.pharmacie.MargeMedicamentDto;
import adc.gestion_hospitaliere.dto.pharmacie.MargePharmacienDto;
import adc.gestion_hospitaliere.dto.pharmacie.RapportMargePharmacieDto;
import adc.gestion_hospitaliere.Enums.StatutLot;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DelivranceService {

    private final DelivranceMedicamentRepository delivranceRepository;
    private final DetailDelivranceRepository detailRepository;
    private final LotMedicamentRepository lotRepository;
    private final MedicamentRepository medicamentRepository;
    private final PersonnelRepository personnelRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final PrescriptionMedicamentRepository prescriptionMedicamentRepository;
    private final AlerteStockService alerteStockService;

    private Personnel getCurrentPharmacien() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        return personnelRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Pharmacien non trouvé pour l'email : " + email));
    }

    // ---------- CREATE ----------
    @Transactional
    public DelivranceResponseDto createDelivrance(DelivranceRequestDto dto) {
        Personnel pharmacien = getCurrentPharmacien();
        patientRepository.findById(dto.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));

        if (dto.getDetails() == null || dto.getDetails().isEmpty()) {
            throw new BusinessException("La délivrance doit contenir au moins un médicament");
        }

        DelivranceMedicament delivrance = DelivranceMedicament.builder()
                .numeroOrdonnance(dto.getNumeroOrdonnance())
                .idPatient(dto.getIdPatient())
                .idMedecinPrescripteur(dto.getIdMedecinPrescripteur())
                .idPrescriptionMed(dto.getIdPrescriptionMed())
                .idPharmacien(pharmacien.getIdPersonnel())
                .motifDelivrance(dto.getMotifDelivrance())
                .observations(dto.getObservations())
                .signatureElectronique(dto.getSignatureElectronique() != null ? dto.getSignatureElectronique() : false)
                .dateDelivrance(LocalDateTime.now())
                .build();
        DelivranceMedicament saved = delivranceRepository.save(delivrance);

        List<DetailDelivrance> details = new ArrayList<>();
        Map<Integer, Integer> quantitesParMedicament = new LinkedHashMap<>();
        for (DetailDelivranceRequestDto detDto : dto.getDetails()) {
            LotMedicament lot = validerLotPourDelivrance(detDto);
            String erreurStock = controlerStock(lot, detDto.getQuantiteDelivree());
            if (erreurStock != null) throw new BusinessException(erreurStock);

            retirerDuLot(lot, detDto.getQuantiteDelivree());
            details.add(construireDetail(saved.getIdDelivrance(), detDto));
            quantitesParMedicament.merge(detDto.getIdMedicament(), detDto.getQuantiteDelivree(), Integer::sum);
        }
        detailRepository.saveAll(details);

        appliquerEffets(
                quantitesParMedicament,
                dto.getIdPrescriptionMed(),
                dto.getNumeroOrdonnance(),
                List.of());
        return convertToResponseDto(saved);
    }

    // ---------- READ ----------
    public PagedResponse<DelivranceResponseDto> getAllDelivrances(Pageable pageable) {
        Page<DelivranceResponseDto> page = delivranceRepository.findAll(pageable)
                .map(this::convertToResponseDto);
        return PagedResponse.of(page);
    }

    public PagedResponse<DelivranceResponseDto> searchDelivrances(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank())
            return getAllDelivrances(pageable);
        Page<DelivranceResponseDto> page = delivranceRepository.searchByKeyword(keyword, pageable)
                .map(this::convertToResponseDto);
        return PagedResponse.of(page);
    }

    public DelivranceResponseDto getDelivranceById(Integer id) {
        return convertToResponseDto(delivranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Délivrance non trouvée")));
    }

    // ---------- UPDATE ----------
    @Transactional
    public DelivranceResponseDto updateDelivrance(Integer id, DelivranceUpdateDto dto) {
        if (!id.equals(dto.getIdDelivrance())) {
            throw new BusinessException("L'ID du path ne correspond pas à l'ID du body");
        }
        DelivranceMedicament del = delivranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Délivrance non trouvée"));

        if (dto.getDetails() == null || dto.getDetails().isEmpty()) {
            throw new BusinessException("La délivrance doit contenir au moins un médicament");
        }

        Integer ancienIdPrescriptionMed = del.getIdPrescriptionMed();
        String ancienNumeroOrdonnance = del.getNumeroOrdonnance();

        // 1. Restituer les anciennes quantités dans les lots
        List<DetailDelivrance> oldDetails = detailRepository.findByIdDelivrance(id);
        Map<Integer, Integer> restitutionParMedicament = new LinkedHashMap<>();
        Map<Integer, LotMedicament> lotsModifies = new LinkedHashMap<>();
        for (DetailDelivrance old : oldDetails) {
            LotMedicament lot = lotRepository.findById(old.getIdLot())
                    .orElseThrow(() -> new ResourceNotFoundException("Lot introuvable pour restauration"));
            restituerAuLot(lot, old.getQuantiteDelivree());
            lotsModifies.put(lot.getIdLot(), lot);
            if (old.getIdMedicament() != null) {
                restitutionParMedicament.merge(old.getIdMedicament(), old.getQuantiteDelivree(), Integer::sum);
            }
        }

        // 2. Supprimer les anciens détails
        detailRepository.deleteByIdDelivrance(id);

        // 3. Appliquer les nouveaux détails (restitution prise en compte)
        List<DetailDelivrance> newDetails = new ArrayList<>();
        Map<Integer, Integer> quantitesParMedicament = new LinkedHashMap<>();
        for (DetailDelivranceUpdateDto detDto : dto.getDetails()) {
            LotMedicament lot = validerLotPourDelivrance(detDto.getIdLot(), detDto.getIdMedicament(), lotsModifies);
            String erreurStock = controlerStock(lot, detDto.getQuantiteDelivree());
            if (erreurStock != null) throw new BusinessException(erreurStock);

            retirerDuLot(lot, detDto.getQuantiteDelivree());
            lotsModifies.put(lot.getIdLot(), lot);

            newDetails.add(construireDetail(id, detDto.getIdMedicament(), detDto.getIdLot(),
                    detDto.getQuantiteDelivree(), detDto.getPrixUnitaire(), detDto.getPriseEnChargeMutuelle()));
            quantitesParMedicament.merge(detDto.getIdMedicament(), detDto.getQuantiteDelivree(), Integer::sum);
        }
        detailRepository.saveAll(newDetails);

        // 4. Mettre à jour les champs simples de la délivrance
        if (dto.getNumeroOrdonnance() != null)
            del.setNumeroOrdonnance(dto.getNumeroOrdonnance());
        del.setIdPatient(dto.getIdPatient());
        del.setIdMedecinPrescripteur(dto.getIdMedecinPrescripteur());
        del.setIdPrescriptionMed(dto.getIdPrescriptionMed());
        del.setMotifDelivrance(dto.getMotifDelivrance());
        if (dto.getObservations() != null)
            del.setObservations(dto.getObservations());
        if (dto.getSignatureElectronique() != null)
            del.setSignatureElectronique(dto.getSignatureElectronique());

        DelivranceMedicament updated = delivranceRepository.save(del);

        // 5. Recalculer les quantités délivrées des prescriptions impactées
        List<Integer> idsPrescriptionsImpactees = new ArrayList<>();
        if (ancienIdPrescriptionMed != null) idsPrescriptionsImpactees.add(ancienIdPrescriptionMed);
        if (dto.getIdPrescriptionMed() != null) idsPrescriptionsImpactees.add(dto.getIdPrescriptionMed());
        appliquerEffets(Map.of(), null, null, idsPrescriptionsImpactees);

        return convertToResponseDto(updated);
    }

    // ---------- DELETE ----------
    @Transactional
    public void deleteDelivrance(Integer id) {
        DelivranceMedicament del = delivranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Délivrance non trouvée"));
        List<DetailDelivrance> details = detailRepository.findByIdDelivrance(id);
        Map<Integer, Integer> restitutionParMedicament = new LinkedHashMap<>();
        for (DetailDelivrance det : details) {
            LotMedicament lot = lotRepository.findById(det.getIdLot())
                    .orElseThrow(() -> new ResourceNotFoundException("Lot introuvable pour suppression"));
            restituerAuLot(lot, det.getQuantiteDelivree());
            if (det.getIdMedicament() != null) {
                restitutionParMedicament.merge(det.getIdMedicament(), det.getQuantiteDelivree(), Integer::sum);
            }
        }
        detailRepository.deleteByIdDelivrance(id);
        delivranceRepository.delete(del);

        List<Integer> idsPrescriptionsImpactees = new ArrayList<>();
        if (del.getIdPrescriptionMed() != null) idsPrescriptionsImpactees.add(del.getIdPrescriptionMed());
        appliquerEffets(Map.of(), null, null, idsPrescriptionsImpactees);
    }

    // ---------- HELPERS DÉLIVRANCE ----------

    private LotMedicament validerLotPourDelivrance(DetailDelivranceRequestDto detDto) {
        return validerLotPourDelivrance(detDto.getIdLot(), detDto.getIdMedicament(), new LinkedHashMap<>());
    }

    private LotMedicament validerLotPourDelivrance(Integer idLot, Integer idMedicament,
                                                    Map<Integer, LotMedicament> lotsModifies) {
        if (idMedicament == null) {
            throw new BusinessException("L'identifiant du médicament est requis pour chaque ligne");
        }
        LotMedicament lot = lotsModifies.get(idLot);
        if (lot == null) {
            lot = lotRepository.findById(idLot)
                    .orElseThrow(() -> new ResourceNotFoundException("Lot introuvable : " + idLot));
        }
        if (lot.getIdMedicament() == null || !lot.getIdMedicament().equals(idMedicament)) {
            throw new BusinessException("Le lot " + lot.getNumeroLot()
                    + " ne correspond pas au médicament sélectionné");
        }
        if (lot.getStatut() == StatutLot.Périmé || lot.getStatut() == StatutLot.Retiré) {
            throw new BusinessException("Le lot " + lot.getNumeroLot() + " est " + lot.getStatut().name()
                    + " et ne peut pas être délivré");
        }
        if (lot.getDatePeremption() != null && lot.getDatePeremption().isBefore(LocalDateTime.now())) {
            throw new BusinessException("Le lot " + lot.getNumeroLot() + " est périmé ("
                    + lot.getDatePeremption().toLocalDate() + ") et ne peut pas être délivré");
        }
        return lot;
    }

    private String controlerStock(LotMedicament lot, Integer quantite) {
        if (quantite == null || quantite <= 0) {
            return "La quantité délivrée doit être strictement positive";
        }
        int restante = lot.getQuantiteRestante() != null ? lot.getQuantiteRestante() : 0;
        if (restante < quantite) {
            return "Stock insuffisant pour le lot " + lot.getNumeroLot()
                    + " (disponible : " + restante + ", demandé : " + quantite + ")";
        }
        return null;
    }

    private void retirerDuLot(LotMedicament lot, Integer quantite) {
        lot.setQuantiteRestante(lot.getQuantiteRestante() - quantite);
        if (lot.getQuantiteRestante() <= 0) {
            lot.setStatut(StatutLot.Rupture);
        } else if (lot.getStatut() == StatutLot.Rupture) {
            lot.setStatut(StatutLot.Disponible);
        }
        lotRepository.save(lot);
    }

    private void restituerAuLot(LotMedicament lot, Integer quantite) {
        if (quantite == null) return;
        lot.setQuantiteRestante(lot.getQuantiteRestante() + quantite);
        if (lot.getQuantiteRestante() > 0 && lot.getStatut() == StatutLot.Rupture) {
            lot.setStatut(StatutLot.Disponible);
        }
        lotRepository.save(lot);
    }

    private DetailDelivrance construireDetail(Integer idDelivrance, DetailDelivranceRequestDto detDto) {
        return construireDetail(idDelivrance, detDto.getIdMedicament(), detDto.getIdLot(),
                detDto.getQuantiteDelivree(), detDto.getPrixUnitaire(), detDto.getPriseEnChargeMutuelle());
    }

    private DetailDelivrance construireDetail(Integer idDelivrance, Integer idMedicament, Integer idLot,
                                              Integer quantite, BigDecimal prixUnitaire, BigDecimal priseEnChargeMutuelle) {
        BigDecimal prix = prixUnitaire != null ? prixUnitaire : BigDecimal.ZERO;
        BigDecimal montantLigne = prix.multiply(BigDecimal.valueOf(quantite));
        BigDecimal priseEnCharge = priseEnChargeMutuelle != null ? priseEnChargeMutuelle : BigDecimal.ZERO;
        BigDecimal resteACharge = montantLigne.subtract(priseEnCharge);
        return DetailDelivrance.builder()
                .idDelivrance(idDelivrance)
                .idMedicament(idMedicament)
                .idLot(idLot)
                .quantiteDelivree(quantite)
                .prixUnitaire(prix)
                .montantLigne(montantLigne)
                .priseEnChargeMutuelle(priseEnCharge)
                .resteACharge(resteACharge)
                .build();
    }

    /**
     * Applique les effets métier d'une délivrance : recalcule les quantités délivrées des
     * prescriptions concernées (par médicament) et rafraîchit les alertes de stock.
     */
    private void appliquerEffets(Map<Integer, Integer> quantitesParMedicament,
                                 Integer idPrescriptionMed,
                                 String numeroOrdonnance,
                                 List<Integer> idsPrescriptionsSupplementaires) {
        LinkedHashSet<Integer> idsPrescriptions = new LinkedHashSet<>();
        if (idsPrescriptionsSupplementaires != null) {
            idsPrescriptionsSupplementaires.stream().filter(Objects::nonNull).forEach(idsPrescriptions::add);
        }
        if (idPrescriptionMed != null) idsPrescriptions.add(idPrescriptionMed);

        // Recalcul des quantités délivrées pour les prescriptions connues
        for (Integer idPm : idsPrescriptions) {
            recalculerQuantiteDelivree(idPm);
        }

        // Rafraîchissement des alertes de stock
        LinkedHashSet<Integer> idsMedicaments = new LinkedHashSet<>(quantitesParMedicament.keySet());
        for (Integer idMed : idsMedicaments) {
            alerteStockService.verifierMedicament(idMed);
        }
    }

    private void recalculerQuantiteDelivree(Integer idPrescriptionMed) {
        PrescriptionMedicament pm = prescriptionMedicamentRepository.findById(idPrescriptionMed).orElse(null);
        if (pm == null) return;
        List<DelivranceMedicament> delivrances =
                delivranceRepository.findByIdPrescriptionMed(idPrescriptionMed);
        int total = 0;
        for (DelivranceMedicament d : delivrances) {
            for (DetailDelivrance det : detailRepository.findByIdDelivrance(d.getIdDelivrance())) {
                if (det.getIdMedicament() != null && det.getIdMedicament().equals(pm.getIdMedicament())
                        && det.getQuantiteDelivree() != null) {
                    total += det.getQuantiteDelivree();
                }
            }
        }
        pm.setQuantiteDelivree(total);
        prescriptionMedicamentRepository.save(pm);
    }

    // ---------- STATISTIQUES ----------
    public Map<String, Object> getStatistiques() {
        long total = delivranceRepository.count();
        LocalDateTime debutMois = LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime finMois = LocalDateTime.of(LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth()), LocalTime.MAX);
        long mois = delivranceRepository.countByDateDelivranceBetween(debutMois, finMois);
        BigDecimal montantTotal = detailRepository.findAll().stream()
                .map(DetailDelivrance::getMontantLigne)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalDelivrances", total);
        result.put("delivrancesCeMois", mois);
        result.put("montantTotal", montantTotal);
        // À compléter avec d'autres indicateurs si nécessaire
        result.put("topMedicaments", new ArrayList<>());
        return result;
    }

    // ---------- RAPPORT MARGE PHARMACIE ----------
    @Transactional(readOnly = true)
    public RapportMargePharmacieDto getRapportMarge(LocalDate dateDebut, LocalDate dateFin) {
        LocalDateTime debut = dateDebut != null
                ? dateDebut.atStartOfDay()
                : LocalDateTime.of(LocalDate.now().withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime fin = dateFin != null
                ? dateFin.atTime(LocalTime.MAX)
                : LocalDateTime.now();

        List<DelivranceMedicament> delivrances = delivranceRepository.findByDateDelivranceBetween(debut, fin);

        // Agrégation par médicament
        Map<Integer, MargeMedicamentDto> parMedicament = new LinkedHashMap<>();
        // Agrégation par pharmacien
        Map<Integer, MargePharmacienDto> parPharmacien = new LinkedHashMap<>();

        BigDecimal caTotal = BigDecimal.ZERO;
        BigDecimal coutTotal = BigDecimal.ZERO;

        for (DelivranceMedicament del : delivrances) {
            MargePharmacienDto pharmacien = parPharmacien.computeIfAbsent(del.getIdPharmacien(), id -> {
                String nom = personnelRepository.findById(id)
                        .map(p -> p.getNom() + " " + p.getPrenom())
                        .orElse("Inconnu");
                return MargePharmacienDto.builder()
                        .idPharmacien(id)
                        .nomPharmacien(nom)
                        .nbDelivrances(0L)
                        .chiffreAffaires(0.0)
                        .coutAchat(0.0)
                        .marge(0.0)
                        .tauxMarge(0.0)
                        .build();
            });
            pharmacien.setNbDelivrances(pharmacien.getNbDelivrances() + 1);

            List<DetailDelivrance> details = detailRepository.findByIdDelivrance(del.getIdDelivrance());
            if (details == null) continue;

            for (DetailDelivrance det : details) {
                BigDecimal prixVente = det.getMontantLigne() != null ? det.getMontantLigne() : BigDecimal.ZERO;
                BigDecimal qte = BigDecimal.valueOf(det.getQuantiteDelivree() != null ? det.getQuantiteDelivree() : 0);

                LotMedicament lot = lotRepository.findById(det.getIdLot()).orElse(null);
                BigDecimal prixAchatUnitaire = lot != null && lot.getPrixAchatUnitaire() != null
                        ? lot.getPrixAchatUnitaire() : BigDecimal.ZERO;
                BigDecimal coutLigne = qte.multiply(prixAchatUnitaire);

                String nomMedicament = medicamentRepository.findById(det.getIdMedicament())
                        .map(Medicament::getNomCommercial).orElse("Inconnu");

                MargeMedicamentDto med = parMedicament.computeIfAbsent(det.getIdMedicament(), id -> MargeMedicamentDto.builder()
                        .idMedicament(id)
                        .nomMedicament(nomMedicament)
                        .quantiteDelivree(0)
                        .prixVenteMoyen(0.0)
                        .prixAchatMoyen(0.0)
                        .chiffreAffaires(0.0)
                        .coutAchat(0.0)
                        .marge(0.0)
                        .tauxMarge(0.0)
                        .build());
                med.setQuantiteDelivree(med.getQuantiteDelivree() + (det.getQuantiteDelivree() != null ? det.getQuantiteDelivree() : 0));
                med.setChiffreAffaires(med.getChiffreAffaires() + prixVente.doubleValue());
                med.setCoutAchat(med.getCoutAchat() + coutLigne.doubleValue());

                pharmacien.setChiffreAffaires(pharmacien.getChiffreAffaires() + prixVente.doubleValue());
                pharmacien.setCoutAchat(pharmacien.getCoutAchat() + coutLigne.doubleValue());

                caTotal = caTotal.add(prixVente);
                coutTotal = coutTotal.add(coutLigne);
            }
        }

        for (MargeMedicamentDto med : parMedicament.values()) {
            med.setMarge(med.getChiffreAffaires() - med.getCoutAchat());
            med.setTauxMarge(med.getChiffreAffaires() > 0 ? (med.getMarge() / med.getChiffreAffaires()) * 100 : 0.0);
            int qte = med.getQuantiteDelivree() != 0 ? med.getQuantiteDelivree() : 1;
            med.setPrixVenteMoyen(med.getChiffreAffaires() / qte);
            med.setPrixAchatMoyen(med.getCoutAchat() / qte);
        }

        for (MargePharmacienDto ph : parPharmacien.values()) {
            ph.setMarge(ph.getChiffreAffaires() - ph.getCoutAchat());
            ph.setTauxMarge(ph.getChiffreAffaires() > 0 ? (ph.getMarge() / ph.getChiffreAffaires()) * 100 : 0.0);
        }

        List<MargeMedicamentDto> listeMedicaments = new ArrayList<>(parMedicament.values());
        listeMedicaments.sort(Comparator.comparingDouble(MargeMedicamentDto::getMarge).reversed());
        List<MargePharmacienDto> listePharmaciens = new ArrayList<>(parPharmacien.values());
        listePharmaciens.sort(Comparator.comparingDouble(MargePharmacienDto::getMarge).reversed());

        double margeTotale = caTotal.subtract(coutTotal).doubleValue();
        return RapportMargePharmacieDto.builder()
                .dateDebut(debut)
                .dateFin(fin)
                .chiffreAffairesTotal(caTotal.doubleValue())
                .coutAchatTotal(coutTotal.doubleValue())
                .margeTotale(margeTotale)
                .tauxMargeTotal(caTotal.doubleValue() > 0 ? (margeTotale / caTotal.doubleValue()) * 100 : 0.0)
                .nbDelivrances((long) delivrances.size())
                .parMedicament(listeMedicaments)
                .parPharmacien(listePharmaciens)
                .build();
    }

    // ---------- CONVERSION ----------
    private DelivranceResponseDto convertToResponseDto(DelivranceMedicament del) {
        String patientNom = patientRepository.findById(del.getIdPatient())
                .map(p -> p.getNom() + " " + p.getPrenom()).orElse("Inconnu");
        String medecinNom = del.getIdMedecinPrescripteur() != null ?
                medecinRepository.findById(del.getIdMedecinPrescripteur()).map(Medecin::getNom).orElse(null) : null;
        String pharmacienNom = personnelRepository.findById(del.getIdPharmacien())
                .map(Personnel::getNom).orElse("Inconnu");

        List<DetailDelivranceResponseDto> detailDtos = detailRepository.findByIdDelivrance(del.getIdDelivrance())
                .stream().map(det -> {
                    String medicamentNom = medicamentRepository.findById(det.getIdMedicament())
                            .map(Medicament::getNomCommercial).orElse("Inconnu");
                    String lotNumero = lotRepository.findById(det.getIdLot())
                            .map(LotMedicament::getNumeroLot).orElse("Inconnu");
                    return DetailDelivranceResponseDto.builder()
                            .idDetailDelivrance(det.getIdDetailDelivrance())
                            .idMedicament(det.getIdMedicament())
                            .medicamentNom(medicamentNom)
                            .idLot(det.getIdLot())
                            .lotNumero(lotNumero)
                            .quantiteDelivree(det.getQuantiteDelivree())
                            .prixUnitaire(det.getPrixUnitaire())
                            .montantLigne(det.getMontantLigne())
                            .priseEnChargeMutuelle(det.getPriseEnChargeMutuelle())
                            .resteACharge(det.getResteACharge())
                            .build();
                }).collect(Collectors.toList());

        return DelivranceResponseDto.builder()
                .idDelivrance(del.getIdDelivrance())
                .numeroOrdonnance(del.getNumeroOrdonnance())
                .idPatient(del.getIdPatient())
                .patientNom(patientNom)
                .idMedecinPrescripteur(del.getIdMedecinPrescripteur())
                .medecinNom(medecinNom)
                .idPrescriptionMed(del.getIdPrescriptionMed())
                .dateDelivrance(del.getDateDelivrance())
                .idPharmacien(del.getIdPharmacien())
                .pharmacienNom(pharmacienNom)
                .motifDelivrance(del.getMotifDelivrance())
                .observations(del.getObservations())
                .signatureElectronique(del.getSignatureElectronique())
                .details(detailDtos)
                .build();
    }
}