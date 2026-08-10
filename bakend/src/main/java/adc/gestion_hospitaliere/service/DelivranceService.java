package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.*;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.delivrance.*;
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
        for (DetailDelivranceRequestDto detDto : dto.getDetails()) {
            LotMedicament lot = lotRepository.findById(detDto.getIdLot())
                    .orElseThrow(() -> new ResourceNotFoundException("Lot introuvable"));
            if (lot.getQuantiteRestante() < detDto.getQuantiteDelivree())
                throw new BusinessException("Stock insuffisant pour le lot " + lot.getNumeroLot());

            lot.setQuantiteRestante(lot.getQuantiteRestante() - detDto.getQuantiteDelivree());
            lotRepository.save(lot);

            BigDecimal montantLigne = detDto.getPrixUnitaire().multiply(BigDecimal.valueOf(detDto.getQuantiteDelivree()));
            BigDecimal priseEnCharge = detDto.getPriseEnChargeMutuelle() != null ? detDto.getPriseEnChargeMutuelle() : BigDecimal.ZERO;
            BigDecimal resteACharge = montantLigne.subtract(priseEnCharge);

            DetailDelivrance detail = DetailDelivrance.builder()
                    .idDelivrance(saved.getIdDelivrance())
                    .idMedicament(detDto.getIdMedicament())
                    .idLot(detDto.getIdLot())
                    .quantiteDelivree(detDto.getQuantiteDelivree())
                    .prixUnitaire(detDto.getPrixUnitaire())
                    .montantLigne(montantLigne)
                    .priseEnChargeMutuelle(priseEnCharge)
                    .resteACharge(resteACharge)
                    .build();
            details.add(detail);
        }
        detailRepository.saveAll(details);
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

        // 1. Restituer les anciennes quantités dans les lots
        List<DetailDelivrance> oldDetails = detailRepository.findByIdDelivrance(id);
        for (DetailDelivrance old : oldDetails) {
            LotMedicament lot = lotRepository.findById(old.getIdLot())
                    .orElseThrow(() -> new ResourceNotFoundException("Lot introuvable pour restauration"));
            lot.setQuantiteRestante(lot.getQuantiteRestante() + old.getQuantiteDelivree());
            lotRepository.save(lot);
        }

        // 2. Supprimer les anciens détails
        detailRepository.deleteByIdDelivrance(id);

        // 3. Appliquer les nouveaux détails
        List<DetailDelivrance> newDetails = new ArrayList<>();
        for (DetailDelivranceUpdateDto detDto : dto.getDetails()) {
            LotMedicament lot = lotRepository.findById(detDto.getIdLot())
                    .orElseThrow(() -> new ResourceNotFoundException("Lot introuvable pour le nouveau détail"));
            if (lot.getQuantiteRestante() < detDto.getQuantiteDelivree()) {
                throw new BusinessException("Stock insuffisant pour le lot " + lot.getNumeroLot());
            }

            lot.setQuantiteRestante(lot.getQuantiteRestante() - detDto.getQuantiteDelivree());
            lotRepository.save(lot);

            BigDecimal montantLigne = detDto.getPrixUnitaire().multiply(BigDecimal.valueOf(detDto.getQuantiteDelivree()));
            BigDecimal priseEnCharge = detDto.getPriseEnChargeMutuelle() != null ? detDto.getPriseEnChargeMutuelle() : BigDecimal.ZERO;
            BigDecimal resteACharge = montantLigne.subtract(priseEnCharge);

            DetailDelivrance detail = DetailDelivrance.builder()
                    .idDelivrance(id)
                    .idMedicament(detDto.getIdMedicament())
                    .idLot(detDto.getIdLot())
                    .quantiteDelivree(detDto.getQuantiteDelivree())
                    .prixUnitaire(detDto.getPrixUnitaire())
                    .montantLigne(montantLigne)
                    .priseEnChargeMutuelle(priseEnCharge)
                    .resteACharge(resteACharge)
                    .build();
            newDetails.add(detail);
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
        return convertToResponseDto(updated);
    }

    // ---------- DELETE ----------
    @Transactional
    public void deleteDelivrance(Integer id) {
        DelivranceMedicament del = delivranceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Délivrance non trouvée"));
        List<DetailDelivrance> details = detailRepository.findByIdDelivrance(id);
        for (DetailDelivrance det : details) {
            LotMedicament lot = lotRepository.findById(det.getIdLot())
                    .orElseThrow(() -> new ResourceNotFoundException("Lot introuvable pour suppression"));
            lot.setQuantiteRestante(lot.getQuantiteRestante() + det.getQuantiteDelivree());
            lotRepository.save(lot);
        }
        detailRepository.deleteByIdDelivrance(id);
        delivranceRepository.delete(del);
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