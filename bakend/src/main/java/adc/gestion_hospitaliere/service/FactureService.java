package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;

import adc.gestion_hospitaliere.Entity.Chambre;
import adc.gestion_hospitaliere.Entity.Consultation;
import adc.gestion_hospitaliere.Entity.DetailDelivrance;
import adc.gestion_hospitaliere.Entity.DetailFacture;
import adc.gestion_hospitaliere.Entity.DelivranceMedicament;
import adc.gestion_hospitaliere.Entity.Examen;
import adc.gestion_hospitaliere.Entity.Prescription;
import adc.gestion_hospitaliere.Entity.PrescriptionMedicament;
import adc.gestion_hospitaliere.Entity.Facture;
import adc.gestion_hospitaliere.Entity.Hospitalisation;
import adc.gestion_hospitaliere.Entity.Medicament;
import adc.gestion_hospitaliere.Entity.Paiement;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Entity.ActeCatalogue;
import adc.gestion_hospitaliere.Entity.SoinInfirmier;
import adc.gestion_hospitaliere.Entity.InterventionUrgence;
import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import adc.gestion_hospitaliere.Enums.ModePaiement;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import adc.gestion_hospitaliere.Enums.StatutFacture;
import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import adc.gestion_hospitaliere.Enums.StatutPaiement;
import adc.gestion_hospitaliere.Repository.ActeMedicalRepository;
import adc.gestion_hospitaliere.Repository.ActeCatalogueRepository;
import adc.gestion_hospitaliere.Repository.ConsultationRepository;
import adc.gestion_hospitaliere.Repository.DetailDelivranceRepository;
import adc.gestion_hospitaliere.Repository.DetailFactureRepository;
import adc.gestion_hospitaliere.Repository.DelivranceMedicamentRepository;
import adc.gestion_hospitaliere.Repository.ExamenRepository;
import adc.gestion_hospitaliere.Repository.FactureRepository;
import adc.gestion_hospitaliere.Repository.HospitalisationRepository;
import adc.gestion_hospitaliere.Repository.MedicamentRepository;
import adc.gestion_hospitaliere.Repository.PaiementRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.Repository.PrescriptionMedicamentRepository;
import adc.gestion_hospitaliere.Repository.PrescriptionRepository;
import adc.gestion_hospitaliere.Repository.SoinInfirmierRepository;
import adc.gestion_hospitaliere.Repository.InterventionUrgenceRepository;
import adc.gestion_hospitaliere.dto.facture.DetailFactureRequestDto;
import adc.gestion_hospitaliere.dto.facture.DetailFactureResponseDto;
import adc.gestion_hospitaliere.dto.facture.ElementFacturableDto;
import adc.gestion_hospitaliere.dto.facture.FactureRequestDto;
import adc.gestion_hospitaliere.dto.facture.FactureResponseDto;
import adc.gestion_hospitaliere.dto.facture.FactureStatsDto;
import adc.gestion_hospitaliere.dto.facture.PaiementRequestDto;
import adc.gestion_hospitaliere.dto.facture.PaiementResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FactureService {

    private final FactureRepository factureRepository;
    private final DetailFactureRepository detailFactureRepository;
    private final PaiementRepository paiementRepository;
    private final PatientRepository patientRepository;
    private final ConsultationRepository consultationRepository;
    private final ExamenRepository examenRepository;
    private final DelivranceMedicamentRepository delivranceMedicamentRepository;
    private final DetailDelivranceRepository detailDelivranceRepository;
    private final HospitalisationRepository hospitalisationRepository;
    private final MedicamentRepository medicamentRepository;
    private final ActeCatalogueRepository acteCatalogueRepository;
    private final SoinInfirmierRepository soinInfirmierRepository;
    private final InterventionUrgenceRepository interventionUrgenceRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionMedicamentRepository prescriptionMedicamentRepository;

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

    // ---------- ÉLÉMENTS FACTURABLES D'UN PATIENT ----------
    @Transactional(readOnly = true)
    public Page<ElementFacturableDto> getElementsFacturables(Integer idPatient, Integer idConsultation,
                                                             Integer idHospitalisation,
                                                             LocalDate dateDebut, LocalDate dateFin,
                                                             Pageable pageable) {
        patientRepository.findById(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'id : " + idPatient));

        if (idConsultation != null) {
            consultationRepository.findById(idConsultation)
                    .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée avec l'id : " + idConsultation));
        }

        List<ElementFacturableDto> elements = new ArrayList<>();
        if (idConsultation == null) {
            // Historique complet du patient (mode "tout")
            elements.addAll(elementsConsultations(idPatient));
            elements.addAll(elementsExamens(idPatient));
            elements.addAll(elementsMedicaments(idPatient));
            ajouterHospitalisations(elements, idPatient, null, idHospitalisation);
            elements.addAll(elementsSoins(idPatient));
            elements.addAll(elementsInterventions(idPatient));
        } else {
            // Facture liée à UNE consultation : seuls les éléments de cette visite
            elements.addAll(elementsConsultations(idPatient, idConsultation));
            elements.addAll(elementsExamens(idPatient, idConsultation));
            elements.addAll(elementsMedicaments(idPatient, idConsultation));
            ajouterHospitalisations(elements, idPatient, idConsultation, idHospitalisation);
            elements.addAll(elementsSoins(idPatient));
            elements.addAll(elementsInterventions(idPatient));
        }

        // Filtre par période de facturation (modèle séjour / journée).
        // Une date nulle = borne ouverte de ce côté.
        if (dateDebut != null || dateFin != null) {
            elements = elements.stream()
                    .filter(el -> el.getDateElement() != null)
                    .filter(el -> {
                        LocalDate d = el.getDateElement().toLocalDate();
                        if (dateDebut != null && d.isBefore(dateDebut)) return false;
                        if (dateFin != null && d.isAfter(dateFin)) return false;
                        return true;
                    })
                    .collect(Collectors.toCollection(ArrayList::new));
        }

        Set<Integer> consultationsFacturees = new HashSet<>(factureRepository.findConsultationsFacturees());
        Set<Integer> hospitalisationsFacturees = new HashSet<>(factureRepository.findHospitalisationsFacturees());
        Set<String> legacyDescriptions = new HashSet<>(factureRepository.findLegacyDescriptionsFacturees());

        List<ElementFacturableDto> nonFactures = new ArrayList<>();
        for (ElementFacturableDto el : elements) {
            Integer idSource = el.getIdSource();
            boolean dejaFacture =
                    (idSource != null && factureRepository.existsDetailFactureNonAnnule(el.getSource(), idSource))
                    || ("CONSULTATION".equals(el.getSource()) && idSource != null && consultationsFacturees.contains(idSource))
                    || ("HOSPITALISATION".equals(el.getSource()) && idSource != null && hospitalisationsFacturees.contains(idSource))
                    // Repli pour les anciennes factures (détails sans source)
                    || (el.getDescription() != null && legacyDescriptions.contains(el.getDescription()));
            if (dejaFacture) continue;
            nonFactures.add(el);
        }
        elements = nonFactures;

        elements.sort((a, b) -> {
            if (a.getDateElement() == null) return 1;
            if (b.getDateElement() == null) return -1;
            return b.getDateElement().compareTo(a.getDateElement());
        });

        int start = (int) pageable.getOffset();
        if (start > elements.size()) start = elements.size();
        int end = Math.min(start + pageable.getPageSize(), elements.size());
        List<ElementFacturableDto> pageContent = elements.subList(start, end);

        return new PageImpl<>(pageContent, pageable, elements.size());
    }

    private List<Integer> idPrescriptionsDeLaConsultation(Integer idConsultation) {
        List<Prescription> prescriptions = prescriptionRepository.findByIdConsultation(idConsultation);
        if (prescriptions == null) return List.of();
        return prescriptions.stream().map(Prescription::getIdPrescription).toList();
    }

    private List<PrescriptionMedicament> prescriptionsMedicamentsDeLaConsultation(Integer idConsultation) {
        List<PrescriptionMedicament> result = new ArrayList<>();
        for (Integer idPrescription : idPrescriptionsDeLaConsultation(idConsultation)) {
            List<PrescriptionMedicament> pms = prescriptionMedicamentRepository.findByIdPrescription(idPrescription);
            if (pms != null) result.addAll(pms);
        }
        return result;
    }

    private List<ElementFacturableDto> elementsConsultations(Integer idPatient) {
        List<ElementFacturableDto> result = new ArrayList<>();
        List<Consultation> consultations = consultationRepository.findByPatient_IdPatient(idPatient);
        if (consultations == null) return result;

        Integer idActeConsultation = findIdActeParCategorie(CategorieActeMedical.Consultation);

        for (Consultation c : consultations) {
            result.add(toConsultationElement(c, idActeConsultation));
        }
        return result;
    }

    private List<ElementFacturableDto> elementsConsultations(Integer idPatient, Integer idConsultation) {
        List<ElementFacturableDto> result = new ArrayList<>();
        Consultation c = consultationRepository.findById(idConsultation).orElse(null);
        if (c == null) return result;
        result.add(toConsultationElement(c, findIdActeParCategorie(CategorieActeMedical.Consultation)));
        return result;
    }

    private ElementFacturableDto toConsultationElement(Consultation c, Integer idActeConsultation) {
        Double prix = prixActeCatalogue(c.getIdActeCatalogue(), idActeConsultation);
        return ElementFacturableDto.builder()
                .source("CONSULTATION")
                .idSource(c.getIdConsultation())
                .idActe(idActeConsultation)
                .idActeCatalogue(c.getIdActeCatalogue())
                .description("Consultation du " + c.getDateConsultation().toLocalDate()
                        + (c.getMotifConsultation() != null && !c.getMotifConsultation().isBlank()
                        ? " - " + c.getMotifConsultation() : ""))
                .quantite(1)
                .prixUnitaire(prix)
                .dateElement(c.getDateConsultation())
                .build();
    }

    // Règle internationale (France / Belgique / Chine) : on ne facture QUE
    // les actes réellement exécutés et tracés. Un examen prescrit/planifié
    // ou annulé n'est jamais facturable.
    private static final Set<StatutExamen> STATUTS_EXAMEN_FACTURABLES =
            EnumSet.of(StatutExamen.Réalisé, StatutExamen.Validé);

    private List<ElementFacturableDto> elementsExamens(Integer idPatient) {
        List<ElementFacturableDto> result = new ArrayList<>();
        List<Examen> examens = examenRepository.findByIdPatient(idPatient);
        if (examens == null) return result;

        Integer idActeExamen = findIdActeParCategorie(CategorieActeMedical.Examen);

        for (Examen e : examens) {
            if (!STATUTS_EXAMEN_FACTURABLES.contains(e.getStatut())) continue;
            result.add(toExamenElement(e, idActeExamen));
        }
        return result;
    }

    private List<ElementFacturableDto> elementsExamens(Integer idPatient, Integer idConsultation) {
        List<ElementFacturableDto> result = new ArrayList<>();
        Integer idActeExamen = findIdActeParCategorie(CategorieActeMedical.Examen);

        for (Integer idPrescription : idPrescriptionsDeLaConsultation(idConsultation)) {
            List<Examen> examens = examenRepository.findByIdPrescription(idPrescription);
            if (examens == null) continue;
            for (Examen e : examens) {
                if (!STATUTS_EXAMEN_FACTURABLES.contains(e.getStatut())) continue;
                result.add(toExamenElement(e, idActeExamen));
            }
        }
        return result;
    }

    private ElementFacturableDto toExamenElement(Examen e, Integer idActeExamen) {
        Double prix = prixActeCatalogue(e.getIdActeCatalogue(), idActeExamen);
        return ElementFacturableDto.builder()
                .source("EXAMEN")
                .idSource(e.getIdExamen())
                .idActe(idActeExamen)
                .idActeCatalogue(e.getIdActeCatalogue())
                .description("Examen " + (e.getTypeExamen() != null ? e.getTypeExamen() : "")
                        + " du " + e.getDatePrescription().toLocalDate())
                .quantite(1)
                .prixUnitaire(prix)
                .dateElement(e.getDatePrescription())
                .build();
    }

    private List<ElementFacturableDto> elementsSoins(Integer idPatient) {
        List<ElementFacturableDto> result = new ArrayList<>();
        Integer idActeSoin = findIdActeParCategorie(CategorieActeMedical.Soin);

        List<Hospitalisation> hospitalisations = hospitalisationRepository.findByPatientId(idPatient);
        if (hospitalisations == null) return result;

        for (Hospitalisation h : hospitalisations) {
            List<SoinInfirmier> soins = soinInfirmierRepository.findByIdHospitalisation(h.getIdHospitalisation());
            if (soins == null) continue;
            for (SoinInfirmier s : soins) {
                // Un soin infirmier n'existe qu'une fois réalisé (tracé) :
                // pas de statut « prescrit » ici, on facture donc directement.
                Double prix = prixActeCatalogue(s.getIdActeCatalogue(), idActeSoin);
                result.add(ElementFacturableDto.builder()
                .source("SOIN")
                .idSource(s.getIdSoin() != null ? s.getIdSoin() : null)
                .idActe(idActeSoin)
                .idActeCatalogue(s.getIdActeCatalogue())
                        .description("Soin " + (s.getTypeSoin() != null ? s.getTypeSoin() : "")
                                + " du " + s.getDateSoin().toLocalDate())
                        .quantite(1)
                        .prixUnitaire(prix)
                        .dateElement(s.getDateSoin())
                        .build());
            }
        }
        return result;
    }

    private List<ElementFacturableDto> elementsMedicaments(Integer idPatient) {
        List<ElementFacturableDto> result = new ArrayList<>();
        Page<DelivranceMedicament> delivrances = delivranceMedicamentRepository
                .findByIdPatient(idPatient, PageRequest.of(0, 1000));
        if (delivrances == null || delivrances.isEmpty()) return result;

        for (DelivranceMedicament d : delivrances.getContent()) {
            result.addAll(toMedicamentElements(d));
        }
        return result;
    }

    private List<ElementFacturableDto> elementsInterventions(Integer idPatient) {
        List<ElementFacturableDto> result = new ArrayList<>();
        Integer idActeIntervention = findIdActeParCategorie(CategorieActeMedical.Intervention);

        Page<InterventionUrgence> interventions = interventionUrgenceRepository
                .findByIdPatient(idPatient, PageRequest.of(0, 1000));
        if (interventions == null || interventions.isEmpty()) return result;

        for (InterventionUrgence i : interventions.getContent()) {
            // Facturable seulement si l'intervention est terminée.
            if (i.getStatut() != null && i.getStatut() != StatutInterventionUrgence.Terminee) continue;
            Double prix = prixActeCatalogue(i.getIdActeCatalogue(), idActeIntervention);
            result.add(ElementFacturableDto.builder()
                .source("INTERVENTION")
                .idSource(i.getIdInterventionUrgence())
                .idActe(idActeIntervention)
                .idActeCatalogue(i.getIdActeCatalogue())
                    .description("Intervention " + (i.getTypeIntervention() != null ? i.getTypeIntervention() : "")
                            + " du " + i.getDateIntervention().toLocalDate())
                    .quantite(1)
                    .prixUnitaire(prix)
                    .dateElement(i.getDateIntervention())
                    .build());
        }
        return result;
    }

    private List<ElementFacturableDto> elementsMedicaments(Integer idPatient, Integer idConsultation) {
        List<ElementFacturableDto> result = new ArrayList<>();
        for (PrescriptionMedicament pm : prescriptionsMedicamentsDeLaConsultation(idConsultation)) {
            List<DelivranceMedicament> delivrances = delivranceMedicamentRepository
                    .findByIdPrescriptionMed(pm.getIdPrescriptionMed());
            if (delivrances == null) continue;
            for (DelivranceMedicament d : delivrances) {
                result.addAll(toMedicamentElements(d));
            }
        }
        return result;
    }

    private List<ElementFacturableDto> toMedicamentElements(DelivranceMedicament d) {
        List<ElementFacturableDto> result = new ArrayList<>();
        List<DetailDelivrance> details = detailDelivranceRepository.findByIdDelivrance(d.getIdDelivrance());
        if (details == null) return result;
        for (DetailDelivrance det : details) {
            String nomMedicament = null;
            if (det.getMedicament() != null) {
                nomMedicament = det.getMedicament().getNomCommercial();
            }
            result.add(ElementFacturableDto.builder()
                    .source("MEDICAMENT")
                    .idSource(det.getIdDetailDelivrance())
                    .idMedicament(det.getIdMedicament())
                    .description("Délivrance médicament"
                            + (nomMedicament != null ? " - " + nomMedicament : "")
                            + " (ordonnance " + (d.getNumeroOrdonnance() != null ? d.getNumeroOrdonnance() : "N/A") + ")")
                    .quantite(det.getQuantiteDelivree() != null ? det.getQuantiteDelivree() : 1)
                    .prixUnitaire(det.getPrixUnitaire() != null ? det.getPrixUnitaire().doubleValue() : 0.0)
                    .dateElement(d.getDateDelivrance())
                    .build());
        }
        return result;
    }

    /**
     * Ajoute les éléments d'hospitalisation. Si une hospitalisation précise est fournie
     * (association de la chambre à la facture), seule celle-ci est prise en compte.
     */
    private void ajouterHospitalisations(List<ElementFacturableDto> elements, Integer idPatient,
                                         Integer idConsultation, Integer idHospitalisation) {
        if (idHospitalisation != null) {
            hospitalisationRepository.findById(idHospitalisation).ifPresent(h -> {
                if (h.getIdPatient() != null && h.getIdPatient().equals(idPatient)) {
                    elements.addAll(toHospitalisationElements(h));
                }
            });
            return;
        }
        if (idConsultation != null) {
            elements.addAll(elementsHospitalisations(idPatient, idConsultation));
        } else {
            elements.addAll(elementsHospitalisations(idPatient));
        }
    }

    private List<ElementFacturableDto> elementsHospitalisations(Integer idPatient) {
        List<ElementFacturableDto> result = new ArrayList<>();
        List<Hospitalisation> hospitalisations = hospitalisationRepository.findByPatientId(idPatient);
        if (hospitalisations == null) return result;

        for (Hospitalisation h : hospitalisations) {
            result.addAll(toHospitalisationElements(h));
        }
        return result;
    }

    private List<ElementFacturableDto> elementsHospitalisations(Integer idPatient, Integer idConsultation) {
        List<ElementFacturableDto> result = new ArrayList<>();
        for (Prescription p : prescriptionRepository.findByIdConsultation(idConsultation)) {
            if (p.getIdHospitalisation() == null) continue;
            Hospitalisation h = hospitalisationRepository.findById(p.getIdHospitalisation()).orElse(null);
            if (h == null) continue;
            result.addAll(toHospitalisationElements(h));
        }
        return result;
    }

    private List<ElementFacturableDto> toHospitalisationElements(Hospitalisation h) {
        List<ElementFacturableDto> result = new ArrayList<>();
        Chambre chambre = h.getChambre();
        String numeroChambre = chambre != null ? chambre.getNumeroChambre() : null;
        Double prixJour = chambre != null ? chambre.getPrixJour() : null;

        int nbJours = nbJoursHospitalisation(h);

        String description = "Hospitalisation - Admission " + h.getNumeroAdmission()
                + (numeroChambre != null ? " - Chambre " + numeroChambre : "")
                + " (" + nbJours + " jour" + (nbJours > 1 ? "s" : "") + ")";

        result.add(ElementFacturableDto.builder()
                .source("HOSPITALISATION")
                .idSource(h.getIdHospitalisation())
                .idHospitalisation(h.getIdHospitalisation())
                .description(description)
                .quantite(nbJours)
                .prixUnitaire(prixJour != null ? prixJour : 0.0)
                .dateElement(h.getDateAdmission())
                .build());

        return result;
    }

    private int nbJoursHospitalisation(Hospitalisation h) {
        if (h.getDateAdmission() == null) return 1;
        java.time.LocalDate fin = h.getDateSortie() != null
                ? h.getDateSortie().toLocalDate()
                : java.time.LocalDate.now();
        java.time.LocalDate debut = h.getDateAdmission().toLocalDate();
        long jours = java.time.temporal.ChronoUnit.DAYS.between(debut, fin) + 1;
        return (int) Math.max(1, jours);
    }

    // Référentiel unique : on cherche dans le catalogue (via le groupe de la catégorie),
    // plus dans l'ancienne table actes_medicaux.
    private Integer findIdActeParCategorie(CategorieActeMedical categorie) {
        List<ActeCatalogue> actes = acteCatalogueRepository
                .findByCategorie(categorie, PageRequest.of(0, 1));
        if (actes == null || actes.isEmpty()) return null;
        return actes.get(0).getIdActeCatalogue();
    }

    private Double prixActe(Integer idActeCatalogue) {
        return acteCatalogueRepository.findById(idActeCatalogue)
                .map(acte -> acte.getPrixDefaut() != null ? acte.getPrixDefaut().doubleValue() : 0.0)
                .orElse(0.0);
    }

    private Double prixActeCatalogue(Integer idActeCatalogue, Integer idActeFallback) {
        if (idActeCatalogue != null) {
            Optional<ActeCatalogue> acte = acteCatalogueRepository.findById(idActeCatalogue);
            if (acte.isPresent() && acte.get().getPrixDefaut() != null) {
                return acte.get().getPrixDefaut().doubleValue();
            }
        }
        return idActeFallback != null ? prixActe(idActeFallback) : 0.0;
    }

    // ---------- CREATE ----------
    @Transactional
    public FactureResponseDto createFacture(FactureRequestDto dto) {
        patientRepository.findById(dto.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'id : " + dto.getIdPatient()));

        BigDecimal tvaRate = dto.getTva() != null ? BigDecimal.valueOf(dto.getTva()) : BigDecimal.ZERO;
        BigDecimal tauxTva = BigDecimal.ONE.add(tvaRate.divide(BigDecimal.valueOf(100)));

        if (dto.getDetails() == null || dto.getDetails().isEmpty()) {
            throw new BusinessException("Une facture doit contenir au moins une ligne");
        }

        List<DetailFacture> details = new ArrayList<>();
        BigDecimal montantHt = BigDecimal.ZERO;
        for (DetailFactureRequestDto detDto : dto.getDetails()) {
            DetailFacture detail = toDetailEntity(detDto, tvaRate);
            details.add(detail);
            montantHt = montantHt.add(detail.getMontantHt());
        }

        BigDecimal montantTtc = montantHt.multiply(tauxTva);

        // ---- Ventilation tiers payant (France / Belgique / Chine) ----
        BigDecimal tauxAssuranceBd = dto.getTauxAssurance() != null
                ? BigDecimal.valueOf(dto.getTauxAssurance()) : BigDecimal.ZERO;
        BigDecimal montantAssurance = montantTtc
                .multiply(tauxAssuranceBd)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal mutuelle = dto.getMutuellePriseEnCharge() != null
                ? BigDecimal.valueOf(dto.getMutuellePriseEnCharge()) : BigDecimal.ZERO;
        // Le total assurance + mutuelle ne peut pas dépasser le montant TTC.
        BigDecimal couverture = montantAssurance.add(mutuelle);
        if (couverture.compareTo(montantTtc) > 0) {
            couverture = montantTtc;
        }
        BigDecimal resteACharge = montantTtc.subtract(couverture).max(BigDecimal.ZERO);

        Facture facture = Facture.builder()
                .numeroFacture(generateNumeroFacture())
                .idPatient(dto.getIdPatient())
                .idHospitalisation(dto.getIdHospitalisation())
                .idConsultation(dto.getIdConsultation())
                .dateEmission(LocalDateTime.now())
                .dateEcheance(dto.getDateEcheance())
                .montantHt(montantHt)
                .tva(tvaRate)
                .montantTtc(montantTtc)
                .montantPaye(BigDecimal.ZERO)
                .montantRestant(montantTtc)
                .statut(StatutFacture.En_attente)
                .assurancePriseEnCharge(dto.getAssurancePriseEnCharge() != null ? dto.getAssurancePriseEnCharge() : false)
                .tauxAssurance(tauxAssuranceBd)
                .montantAssurance(montantAssurance)
                .mutuelleId(dto.getMutuelleId())
                .mutuellePriseEnCharge(mutuelle)
                .resteAChargePatient(resteACharge)
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

        if (StatutFacture.Annulé.equals(facture.getStatut())) {
            throw new BusinessException("Impossible de modifier une facture annulée");
        }
        if (dto.getDetails() == null || dto.getDetails().isEmpty()) {
            throw new BusinessException("Une facture doit contenir au moins une ligne");
        }

        BigDecimal tvaRate = dto.getTva() != null ? BigDecimal.valueOf(dto.getTva()) : BigDecimal.ZERO;
        BigDecimal tauxTva = BigDecimal.ONE.add(tvaRate.divide(BigDecimal.valueOf(100)));

        List<DetailFacture> newDetails = new ArrayList<>();
        BigDecimal montantHt = BigDecimal.ZERO;
        for (DetailFactureRequestDto detDto : dto.getDetails()) {
            DetailFacture detail = toDetailEntity(detDto, tvaRate);
            detail.setIdFacture(facture.getIdFacture());
            detail.setFacture(facture);
            newDetails.add(detail);
            montantHt = montantHt.add(detail.getMontantHt());
        }

        BigDecimal montantTtc = montantHt.multiply(tauxTva);
        BigDecimal dejaPaye = facture.getMontantPaye() != null ? facture.getMontantPaye() : BigDecimal.ZERO;
        BigDecimal nouveauRestant = montantTtc.subtract(dejaPaye);
        if (nouveauRestant.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("Le nouveau montant TTC (" + montantTtc
                    + ") est inférieur aux paiements déjà encaissés (" + dejaPaye + ")");
        }

        facture.setIdPatient(dto.getIdPatient());
        facture.setIdHospitalisation(dto.getIdHospitalisation());
        facture.setIdConsultation(dto.getIdConsultation());
        facture.setDateEcheance(dto.getDateEcheance());
        facture.setTva(tvaRate);
        facture.setMontantHt(montantHt);
        facture.setMontantTtc(montantTtc);
        facture.setMontantRestant(nouveauRestant);
        facture.setAssurancePriseEnCharge(dto.getAssurancePriseEnCharge() != null ? dto.getAssurancePriseEnCharge() : false);
        BigDecimal tauxAssuranceMaj = dto.getTauxAssurance() != null
                ? BigDecimal.valueOf(dto.getTauxAssurance()) : BigDecimal.ZERO;
        BigDecimal montantAssuranceMaj = montantTtc
                .multiply(tauxAssuranceMaj)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal mutuelleMaj = dto.getMutuellePriseEnCharge() != null
                ? BigDecimal.valueOf(dto.getMutuellePriseEnCharge()) : BigDecimal.ZERO;
        BigDecimal couvertureMaj = montantAssuranceMaj.add(mutuelleMaj);
        if (couvertureMaj.compareTo(montantTtc) > 0) couvertureMaj = montantTtc;
        facture.setTauxAssurance(tauxAssuranceMaj);
        facture.setMontantAssurance(montantAssuranceMaj);
        facture.setMutuelleId(dto.getMutuelleId());
        facture.setMutuellePriseEnCharge(mutuelleMaj);
        facture.setResteAChargePatient(montantTtc.subtract(couvertureMaj).max(BigDecimal.ZERO));
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
        long nbPaiements = paiementRepository.countByFactureIdFacture(facture.getIdFacture());
        if (nbPaiements > 0) {
            throw new BusinessException("Impossible de supprimer une facture avec des paiements");
        }
        detailFactureRepository.deleteByFactureIdFacture(facture.getIdFacture());
        factureRepository.delete(facture);
    }

    // ---------- ANNULATION ----------
    @Transactional
    public FactureResponseDto annulerFacture(Integer id) {
        Facture facture = getFacture(id);
        if (StatutFacture.Annulé.equals(facture.getStatut())) {
            throw new BusinessException("Cette facture est déjà annulée");
        }
        BigDecimal dejaPaye = facture.getMontantPaye() != null ? facture.getMontantPaye() : BigDecimal.ZERO;
        if (dejaPaye.compareTo(BigDecimal.ZERO) > 0) {
            throw new BusinessException("Impossible d'annuler une facture ayant des paiements encaissés");
        }
        facture.setStatut(StatutFacture.Annulé);
        facture = factureRepository.save(facture);
        return toResponseDto(facture);
    }

    // ---------- PAIEMENTS ----------
    @Transactional
    public FactureResponseDto ajouterPaiement(Integer idFacture, PaiementRequestDto dto) {
        Facture facture = getFacture(idFacture);

        if (StatutFacture.Annulé.equals(facture.getStatut())) {
            throw new BusinessException("Impossible d'encaisser un paiement sur une facture annulée");
        }

        BigDecimal montant = BigDecimal.valueOf(dto.getMontant());
        if (montant.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Le montant du paiement doit être supérieur à zéro");
        }
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

        BigDecimal payeActuel = facture.getMontantPaye() != null ? facture.getMontantPaye() : BigDecimal.ZERO;
        BigDecimal montantPaye = payeActuel.add(montant);
        facture.setMontantPaye(montantPaye);
        BigDecimal totalTtc = facture.getMontantTtc() != null ? facture.getMontantTtc() : BigDecimal.ZERO;
        facture.setMontantRestant(totalTtc.subtract(montantPaye));
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
        return getStatistiques(null, null, "month");
    }

    /**
     * Statistiques de facturation sur une période et une granularité données.
     * granularite : "day", "month" ou "year" (défaut "month").
     */
    public FactureStatsDto getStatistiques(LocalDate dateDebut, LocalDate dateFin, String granularite) {
        LocalDateTime start = dateDebut != null ? dateDebut.atStartOfDay() : null;
        LocalDateTime end = dateFin != null ? dateFin.atTime(23, 59, 59) : null;

        String gran = granularite == null ? "month" : granularite.toLowerCase();

        long totalFactures = factureRepository.countPeriode(start, end);
        Double totalMontantEmis = toDouble(factureRepository.sumMontantTtcPeriode(start, end));
        Double totalPaye = toDouble(factureRepository.sumMontantPayePeriode(start, end));
        Double totalRestant = toDouble(factureRepository.sumMontantRestantPeriode(start, end));

        List<Map<String, Object>> parStatut = new ArrayList<>();
        for (Object[] row : factureRepository.statsParStatut(start, end)) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("statut", row[0] != null ? row[0].toString() : "Inconnu");
            item.put("nombre", row[1] != null ? ((Number) row[1]).longValue() : 0L);
            item.put("montantEmis", toDouble((BigDecimal) row[2]));
            item.put("montantPaye", toDouble((BigDecimal) row[3]));
            parStatut.add(item);
        }

        List<Object[]> rows = switch (gran) {
            case "day" -> factureRepository.statsParJour(start, end);
            case "year" -> factureRepository.statsParAnnee(start, end);
            default -> factureRepository.statsParMoisGran(start, end);
        };

        List<Map<String, Object>> parMois = new ArrayList<>();
        for (Object[] row : rows) {
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
                .idActeCatalogue(dto.getIdActeCatalogue())
                .idMedicament(dto.getIdMedicament())
                .source(dto.getSource())
                .idSource(dto.getIdSource())
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
                .idConsultation(facture.getIdConsultation())
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
                .tauxAssurance(toDouble(facture.getTauxAssurance()))
                .montantAssurance(toDouble(facture.getMontantAssurance()))
                .mutuelleId(facture.getMutuelleId())
                .mutuellePriseEnCharge(toDouble(facture.getMutuellePriseEnCharge()))
                .resteAChargePatient(toDouble(facture.getResteAChargePatient()))
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
        String acteCatalogueLibelle = null;
        if (detail.getActeCatalogue() != null) {
            acteCatalogueLibelle = detail.getActeCatalogue().getLibelle();
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
                .idActeCatalogue(detail.getIdActeCatalogue())
                .acteCatalogueLibelle(acteCatalogueLibelle)
                .idMedicament(detail.getIdMedicament())
                .medicamentNom(medicamentNom)
                .source(detail.getSource())
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
