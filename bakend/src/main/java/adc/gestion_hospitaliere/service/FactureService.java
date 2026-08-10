package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;

import adc.gestion_hospitaliere.Entity.DetailFacture;
import adc.gestion_hospitaliere.Entity.Facture;
import adc.gestion_hospitaliere.Entity.Paiement;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Enums.ModePaiement;
import adc.gestion_hospitaliere.Enums.StatutFacture;
import adc.gestion_hospitaliere.Enums.StatutPaiement;
import adc.gestion_hospitaliere.Repository.DetailFactureRepository;
import adc.gestion_hospitaliere.Repository.FactureRepository;
import adc.gestion_hospitaliere.Repository.PaiementRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.dto.facture.DetailFactureRequestDto;
import adc.gestion_hospitaliere.dto.facture.DetailFactureResponseDto;
import adc.gestion_hospitaliere.dto.facture.FactureRequestDto;
import adc.gestion_hospitaliere.dto.facture.FactureResponseDto;
import adc.gestion_hospitaliere.dto.facture.FactureStatsDto;
import adc.gestion_hospitaliere.dto.facture.PaiementRequestDto;
import adc.gestion_hospitaliere.dto.facture.PaiementResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final FactureRepository factureRepository;
    private final DetailFactureRepository detailFactureRepository;
    private final PaiementRepository paiementRepository;
    private final PatientRepository patientRepository;

    // ---------- READ ----------
    public Page<FactureResponseDto> getAllFactures(StatutFacture statut, Integer idPatient,
                                                   LocalDateTime dateStart, LocalDateTime dateEnd,
                                                   Pageable pageable) {
        return factureRepository.searchFactures(statut, idPatient, dateStart, dateEnd, pageable)
                .map(this::toResponseDto);
    }

    public FactureResponseDto getFactureById(Integer id) {
        return toResponseDto(getFacture(id));
    }

    // ---------- CREATE ----------
    @Transactional
    public FactureResponseDto createFacture(FactureRequestDto dto) {
        patientRepository.findById(dto.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'id : " + dto.getIdPatient()));

        BigDecimal tvaRate = dto.getTva() != null ? BigDecimal.valueOf(dto.getTva()) : BigDecimal.ZERO;
        BigDecimal tauxTva = BigDecimal.ONE.add(tvaRate.divide(BigDecimal.valueOf(100)));

        List<DetailFacture> details = new ArrayList<>();
        BigDecimal montantHt = BigDecimal.ZERO;
        if (dto.getDetails() != null) {
            for (DetailFactureRequestDto detDto : dto.getDetails()) {
                DetailFacture detail = toDetailEntity(detDto, tvaRate);
                details.add(detail);
                montantHt = montantHt.add(detail.getMontantHt());
            }
        }

        BigDecimal montantTtc = montantHt.multiply(tauxTva);

        Facture facture = Facture.builder()
                .numeroFacture(generateNumeroFacture())
                .idPatient(dto.getIdPatient())
                .idHospitalisation(dto.getIdHospitalisation())
                .dateEmission(LocalDateTime.now())
                .dateEcheance(dto.getDateEcheance())
                .montantHt(montantHt)
                .tva(tvaRate)
                .montantTtc(montantTtc)
                .montantPaye(BigDecimal.ZERO)
                .montantRestant(montantTtc)
                .statut(StatutFacture.En_attente)
                .assurancePriseEnCharge(dto.getAssurancePriseEnCharge() != null ? dto.getAssurancePriseEnCharge() : false)
                .mutuelleId(dto.getMutuelleId())
                .mutuellePriseEnCharge(dto.getMutuellePriseEnCharge() != null ? BigDecimal.valueOf(dto.getMutuellePriseEnCharge()) : null)
                .notesComptables(dto.getNotesComptables())
                .build();
        facture = factureRepository.save(facture);

        for (DetailFacture detail : details) {
            detail.setIdFacture(facture.getIdFacture());
            detail.setFacture(facture);
        }
        detailFactureRepository.saveAll(details);
        facture.setDetails(details);

        return toResponseDto(facture);
    }

    // ---------- UPDATE ----------
    @Transactional
    public FactureResponseDto updateFacture(Integer id, FactureRequestDto dto) {
        Facture facture = getFacture(id);

        BigDecimal tvaRate = dto.getTva() != null ? BigDecimal.valueOf(dto.getTva()) : BigDecimal.ZERO;
        BigDecimal tauxTva = BigDecimal.ONE.add(tvaRate.divide(BigDecimal.valueOf(100)));

        List<DetailFacture> newDetails = new ArrayList<>();
        BigDecimal montantHt = BigDecimal.ZERO;
        if (dto.getDetails() != null) {
            for (DetailFactureRequestDto detDto : dto.getDetails()) {
                DetailFacture detail = toDetailEntity(detDto, tvaRate);
                detail.setIdFacture(facture.getIdFacture());
                detail.setFacture(facture);
                newDetails.add(detail);
                montantHt = montantHt.add(detail.getMontantHt());
            }
        }

        BigDecimal montantTtc = montantHt.multiply(tauxTva);

        facture.setIdPatient(dto.getIdPatient());
        facture.setIdHospitalisation(dto.getIdHospitalisation());
        facture.setDateEcheance(dto.getDateEcheance());
        facture.setTva(tvaRate);
        facture.setMontantHt(montantHt);
        facture.setMontantTtc(montantTtc);
        facture.setMontantRestant(montantTtc.subtract(facture.getMontantPaye()));
        facture.setAssurancePriseEnCharge(dto.getAssurancePriseEnCharge() != null ? dto.getAssurancePriseEnCharge() : false);
        facture.setMutuelleId(dto.getMutuelleId());
        facture.setMutuellePriseEnCharge(dto.getMutuellePriseEnCharge() != null ? BigDecimal.valueOf(dto.getMutuellePriseEnCharge()) : null);
        facture.setNotesComptables(dto.getNotesComptables());

        detailFactureRepository.deleteByFactureIdFacture(facture.getIdFacture());
        facture.getDetails().clear();
        facture.getDetails().addAll(newDetails);

        facture = factureRepository.save(facture);
        return toResponseDto(facture);
    }

    // ---------- DELETE ----------
    @Transactional
    public void deleteFacture(Integer id) {
        Facture facture = getFacture(id);
        if (facture.getPaiements() != null && !facture.getPaiements().isEmpty()) {
            throw new BusinessException("Impossible de supprimer une facture avec des paiements");
        }
        detailFactureRepository.deleteByFactureIdFacture(facture.getIdFacture());
        factureRepository.delete(facture);
    }

    // ---------- ANNULATION ----------
    @Transactional
    public FactureResponseDto annulerFacture(Integer id) {
        Facture facture = getFacture(id);
        facture.setStatut(StatutFacture.Annulé);
        facture = factureRepository.save(facture);
        return toResponseDto(facture);
    }

    // ---------- PAIEMENTS ----------
    @Transactional
    public FactureResponseDto ajouterPaiement(Integer idFacture, PaiementRequestDto dto) {
        Facture facture = getFacture(idFacture);

        BigDecimal montant = BigDecimal.valueOf(dto.getMontant());
        BigDecimal restant = facture.getMontantRestant() != null ? facture.getMontantRestant() : BigDecimal.ZERO;
        if (montant.compareTo(restant) > 0) {
            throw new BusinessException("Le montant du paiement (" + dto.getMontant()
                    + ") dépasse le montant restant de la facture (" + restant + ")");
        }

        Paiement paiement = Paiement.builder()
                .idFacture(facture.getIdFacture())
                .datePaiement(LocalDateTime.now())
                .montant(montant)
                .modePaiement(dto.getModePaiement() != null ? dto.getModePaiement() : ModePaiement.Espèces)
                .referencePaiement(dto.getReferencePaiement())
                .encaissePar(dto.getEncaissePar())
                .statut(StatutPaiement.Effectue)
                .notes(dto.getNotes())
                .build();
        paiement.setFacture(facture);
        paiementRepository.save(paiement);

        BigDecimal montantPaye = facture.getMontantPaye().add(montant);
        facture.setMontantPaye(montantPaye);
        facture.setMontantRestant(facture.getMontantTtc().subtract(montantPaye));
        mettreAJourStatut(facture);

        facture = factureRepository.save(facture);
        return toResponseDto(facture);
    }

    private void mettreAJourStatut(Facture facture) {
        BigDecimal paye = facture.getMontantPaye() != null ? facture.getMontantPaye() : BigDecimal.ZERO;
        BigDecimal restant = facture.getMontantRestant() != null ? facture.getMontantRestant() : BigDecimal.ZERO;
        if (restant.compareTo(BigDecimal.ZERO) <= 0) {
            facture.setStatut(StatutFacture.Payé);
            facture.setDatePaiementTotal(LocalDateTime.now());
        } else if (paye.compareTo(BigDecimal.ZERO) > 0) {
            facture.setStatut(StatutFacture.Partiellement_payé);
            facture.setDatePaiementTotal(null);
        } else {
            facture.setStatut(StatutFacture.En_attente);
            facture.setDatePaiementTotal(null);
        }
    }

    // ---------- STATISTIQUES ----------
    public FactureStatsDto getStatistiques() {
        long totalFactures = factureRepository.count();
        Double totalMontantEmis = toDouble(factureRepository.sumMontantTtc());
        Double totalPaye = toDouble(factureRepository.sumMontantPaye());
        Double totalRestant = toDouble(factureRepository.sumMontantRestant());

        List<Map<String, Object>> parStatut = new ArrayList<>();
        for (Object[] row : factureRepository.statsParStatut()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("statut", row[0] != null ? row[0].toString() : "Inconnu");
            item.put("nombre", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            item.put("montantEmis", toDouble((BigDecimal) row[2]));
            item.put("montantPaye", toDouble((BigDecimal) row[3]));
            parStatut.add(item);
        }

        List<Map<String, Object>> parMois = new ArrayList<>();
        for (Object[] row : factureRepository.statsParMois()) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("mois", row[0] != null ? row[0].toString() : null);
            item.put("nombre", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            item.put("montant", toDouble((BigDecimal) row[2]));
            parMois.add(item);
        }

        return FactureStatsDto.builder()
                .totalFactures(totalFactures)
                .totalMontantEmis(totalMontantEmis)
                .totalPaye(totalPaye)
                .totalRestant(totalRestant)
                .parStatut(parStatut)
                .parMois(parMois)
                .build();
    }

    // ---------- HELPERS ----------
    private String generateNumeroFacture() {
        int annee = LocalDate.now().getYear();
        long compteur = factureRepository.count() + 1;
        String numero;
        do {
            numero = "FAC-" + annee + "-" + String.format("%04d", compteur);
            compteur++;
        } while (factureRepository.existsByNumeroFacture(numero));
        return numero;
    }

    private Facture getFacture(Integer id) {
        return factureRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Facture non trouvée avec l'id : " + id));
    }

    private DetailFacture toDetailEntity(DetailFactureRequestDto dto, BigDecimal tvaRate) {
        BigDecimal prixUnitaire = BigDecimal.valueOf(dto.getPrixUnitaire());
        BigDecimal quantite = dto.getQuantite() != null ? BigDecimal.valueOf(dto.getQuantite()) : BigDecimal.ONE;
        BigDecimal remise = dto.getRemise() != null ? BigDecimal.valueOf(dto.getRemise()) : BigDecimal.ZERO;

        BigDecimal montantHt = prixUnitaire.multiply(quantite).subtract(remise);
        BigDecimal tauxTva = BigDecimal.ONE.add(tvaRate.divide(BigDecimal.valueOf(100)));
        BigDecimal montantTtc = montantHt.multiply(tauxTva);

        return DetailFacture.builder()
                .idActe(dto.getIdActe())
                .idMedicament(dto.getIdMedicament())
                .description(dto.getDescription())
                .quantite(dto.getQuantite() != null ? dto.getQuantite() : 1)
                .prixUnitaire(prixUnitaire)
                .remise(remise)
                .montantHt(montantHt)
                .montantTtc(montantTtc)
                .build();
    }

    private Double toDouble(BigDecimal value) {
        return value != null ? value.doubleValue() : 0.0;
    }

    // ---------- MAPPERS ----------
    private FactureResponseDto toResponseDto(Facture facture) {
        String patientNom = null, patientPrenom = null;
        if (facture.getPatient() != null) {
            patientNom = facture.getPatient().getNom();
            patientPrenom = facture.getPatient().getPrenom();
        }

        List<DetailFactureResponseDto> detailDtos = new ArrayList<>();
        if (facture.getDetails() != null) {
            for (DetailFacture detail : facture.getDetails()) {
                detailDtos.add(toDetailResponseDto(detail));
            }
        }

        List<PaiementResponseDto> paiementDtos = new ArrayList<>();
        if (facture.getPaiements() != null) {
            for (Paiement paiement : facture.getPaiements()) {
                paiementDtos.add(toPaiementResponseDto(paiement));
            }
        }

        return FactureResponseDto.builder()
                .idFacture(facture.getIdFacture())
                .numeroFacture(facture.getNumeroFacture())
                .idPatient(facture.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .idHospitalisation(facture.getIdHospitalisation())
                .dateEmission(facture.getDateEmission())
                .dateEcheance(facture.getDateEcheance())
                .montantHt(toDouble(facture.getMontantHt()))
                .tva(toDouble(facture.getTva()))
                .montantTtc(toDouble(facture.getMontantTtc()))
                .montantPaye(toDouble(facture.getMontantPaye()))
                .montantRestant(toDouble(facture.getMontantRestant()))
                .statut(facture.getStatut())
                .modePaiement(facture.getModePaiement())
                .assurancePriseEnCharge(facture.getAssurancePriseEnCharge())
                .mutuelleId(facture.getMutuelleId())
                .mutuellePriseEnCharge(toDouble(facture.getMutuellePriseEnCharge()))
                .datePaiementTotal(facture.getDatePaiementTotal())
                .notesComptables(facture.getNotesComptables())
                .details(detailDtos)
                .paiements(paiementDtos)
                .build();
    }

    private DetailFactureResponseDto toDetailResponseDto(DetailFacture detail) {
        String acteLibelle = null;
        if (detail.getActe() != null) {
            acteLibelle = detail.getActe().getLibelle();
        }
        String medicamentNom = null;
        if (detail.getMedicament() != null) {
            medicamentNom = detail.getMedicament().getNomCommercial();
        }
        return DetailFactureResponseDto.builder()
                .idDetail(detail.getIdDetail())
                .idFacture(detail.getIdFacture())
                .idActe(detail.getIdActe())
                .acteLibelle(acteLibelle)
                .idMedicament(detail.getIdMedicament())
                .medicamentNom(medicamentNom)
                .description(detail.getDescription())
                .quantite(detail.getQuantite())
                .prixUnitaire(toDouble(detail.getPrixUnitaire()))
                .remise(toDouble(detail.getRemise()))
                .montantHt(toDouble(detail.getMontantHt()))
                .montantTtc(toDouble(detail.getMontantTtc()))
                .build();
    }

    private PaiementResponseDto toPaiementResponseDto(Paiement paiement) {
        String encaisseurNom = null;
        if (paiement.getEncaisseur() != null) {
            encaisseurNom = paiement.getEncaisseur().getNom() + " " + paiement.getEncaisseur().getPrenom();
        }
        return PaiementResponseDto.builder()
                .idPaiement(paiement.getIdPaiement())
                .idFacture(paiement.getIdFacture())
                .datePaiement(paiement.getDatePaiement())
                .montant(toDouble(paiement.getMontant()))
                .modePaiement(paiement.getModePaiement())
                .referencePaiement(paiement.getReferencePaiement())
                .encaissePar(paiement.getEncaissePar())
                .encaisseurNom(encaisseurNom)
                .statut(paiement.getStatut())
                .notes(paiement.getNotes())
                .build();
    }
}
