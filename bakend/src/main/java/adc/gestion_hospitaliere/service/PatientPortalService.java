package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.ConstanteHospitalisation;
import adc.gestion_hospitaliere.Entity.Consultation;
import adc.gestion_hospitaliere.Entity.Examen;
import adc.gestion_hospitaliere.Entity.Facture;
import adc.gestion_hospitaliere.Entity.Hospitalisation;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Entity.Prescription;
import adc.gestion_hospitaliere.Entity.RendezVous;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import adc.gestion_hospitaliere.Enums.StatutFacture;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import adc.gestion_hospitaliere.Repository.ConstanteHospitalisationRepository;
import adc.gestion_hospitaliere.Repository.ConsultationRepository;
import adc.gestion_hospitaliere.Repository.ExamenRepository;
import adc.gestion_hospitaliere.Repository.FactureRepository;
import adc.gestion_hospitaliere.Repository.HospitalisationRepository;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.Repository.PrescriptionRepository;
import adc.gestion_hospitaliere.Repository.RendezVousRepository;
import adc.gestion_hospitaliere.exception.BusinessException;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Portail patient : toutes les méthodes s'appuient sur l'id du patient
 * lié au compte connecté (jamais fourni par le client), garantissant
 * qu'un patient ne voit et ne modifie que son propre dossier.
 */
@Service
@RequiredArgsConstructor
public class PatientPortalService {

    private final CurrentUserService currentUserService;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final RendezVousRepository rendezVousRepository;
    private final ExamenRepository examenRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ConsultationRepository consultationRepository;
    private final FactureRepository factureRepository;
    private final HospitalisationRepository hospitalisationRepository;
    private final ConstanteHospitalisationRepository constanteRepository;

    /** Id du patient connecté (contrôlé). */
    private Integer pid() {
        return currentUserService.patientIdObligatoire();
    }

    // ==================== MÉDECINS (pour demander un RDV) ====================

    public List<Map<String, Object>> getMedecinsDisponibles() {
        return medecinRepository.findAll().stream()
                .map(m -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("idMedecin", m.getIdMedecin());
                    item.put("nom", m.getNom());
                    item.put("prenom", m.getPrenom());
                    item.put("specialite", m.getSpecialite() != null ? m.getSpecialite().getNomSpecialite() : null);
                    return item;
                })
                .collect(Collectors.toList());
    }

    // ==================== DOSSIER ====================

    public Map<String, Object> getDossier() {
        Integer idPatient = pid();
        Patient p = patientRepository.findById(idPatient)
                .orElseThrow(() -> new ResourceNotFoundException("Patient introuvable"));

        Map<String, Object> infos = new LinkedHashMap<>();
        infos.put("idPatient", p.getIdPatient());
        infos.put("nom", p.getNom());
        infos.put("prenom", p.getPrenom());
        infos.put("dateNaissance", p.getDateNaissance());
        infos.put("genre", p.getGenre() != null ? p.getGenre().name() : null);
        infos.put("groupeSanguin", p.getGroupeSanguin() != null ? p.getGroupeSanguin().name() : null);
        infos.put("telephone", p.getTelephone());
        infos.put("email", p.getEmail());
        infos.put("adresse", p.getAdresse());
        infos.put("numeroSecuriteSociale", p.getNumeroSecuriteSociale());
        infos.put("situationFamiliale", p.getSituationFamiliale() != null ? p.getSituationFamiliale().name() : null);
        infos.put("allergies", p.getAllergies());
        infos.put("antecedentsMedicaux", p.getAntecedentsMedicaux());
        infos.put("antecedentsChirurgicaux", p.getAntecedentsChirurgicaux());
        infos.put("traitementHabituel", p.getTraitementHabituel());

        List<Hospitalisation> hospitalisations = hospitalisationRepository.findByPatientId(idPatient);
        List<Map<String, Object>> constantes = new ArrayList<>();
        for (Hospitalisation h : hospitalisations) {
            for (ConstanteHospitalisation c : constanteRepository
                    .findByIdHospitalisationOrderByDateMesureDesc(h.getIdHospitalisation())) {
                Map<String, Object> item = new LinkedHashMap<>();
                item.put("dateMesure", c.getDateMesure());
                item.put("temperature", c.getTemperature());
                item.put("pouls", c.getPouls());
                item.put("pressionSystolique", c.getPressionSystolique());
                item.put("pressionDiastolique", c.getPressionDiastolique());
                item.put("saturation", c.getSaturation());
                item.put("frequenceRespiratoire", c.getFrequenceRespiratoire());
                item.put("glycemie", c.getGlycemie());
                item.put("observations", c.getObservations());
                constantes.add(item);
            }
        }

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("informations", infos);
        result.put("constantes", constantes);
        return result;
    }

    // ==================== RENDEZ-VOUS ====================

    public List<Map<String, Object>> getMesRendezVous() {
        Integer idPatient = pid();
        return rendezVousRepository.findByIdPatient(idPatient, PageRequest.of(0, 200))
                .getContent().stream()
                .sorted((a, b) -> b.getDateRdv().compareTo(a.getDateRdv()))
                .map(this::toRdvDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> demanderRendezVous(LocalDateTime dateRdv, Integer idMedecin, String motif) {
        Integer idPatient = pid();
        if (dateRdv == null) {
            throw new BusinessException("La date du rendez-vous est obligatoire");
        }
        if (idMedecin == null) {
            throw new BusinessException("Le médecin est obligatoire");
        }
        if (dateRdv.isBefore(LocalDateTime.now())) {
            throw new BusinessException("La date demandée doit être future");
        }
        RendezVous rdv = RendezVous.builder()
                .idPatient(idPatient)
                .idMedecin(idMedecin)
                .dateRdv(dateRdv)
                .motif(motif)
                .statut(StatutRendezVous.Programmé)
                .typeConsultation("Consultation")
                .dureeEstimee(30)
                .rappelEnvoye(false)
                .build();
        return toRdvDto(rendezVousRepository.save(rdv));
    }

    @Transactional
    public Map<String, Object> annulerRendezVous(Integer idRdv) {
        Integer idPatient = pid();
        RendezVous rdv = rendezVousRepository.findById(idRdv)
                .orElseThrow(() -> new ResourceNotFoundException("Rendez-vous introuvable"));
        // Un patient ne peut annuler que SON rendez-vous.
        if (!idPatient.equals(rdv.getIdPatient())) {
            throw new BusinessException("Ce rendez-vous ne vous appartient pas");
        }
        rdv.setStatut(StatutRendezVous.Annulé);
        return toRdvDto(rendezVousRepository.save(rdv));
    }

    private Map<String, Object> toRdvDto(RendezVous r) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idRdv", r.getIdRdv());
        m.put("dateRdv", r.getDateRdv());
        m.put("statut", r.getStatut() != null ? r.getStatut().name() : null);
        m.put("motif", r.getMotif());
        // On ne sérialise JAMAIS l'entité Medecin (relation bidirectionnelle avec
        // Specialite -> Medecin provoquerait une récursion infinie en JSON).
        Medecin med = r.getMedecin();
        m.put("medecinNom", med != null ? "Dr. " + med.getPrenom() + " " + med.getNom() : null);
        m.put("medecinSpecialite", null);
        return m;
    }

    // ==================== EXAMENS (résultats validés) ====================

    public List<Map<String, Object>> getMesExamens() {
        Integer idPatient = pid();
        return examenRepository.findByIdPatient(idPatient).stream()
                .filter(e -> e.getStatut() == StatutExamen.Réalisé || e.getStatut() == StatutExamen.Validé)
                .sorted((a, b) -> {
                    LocalDateTime da = a.getDateRealisation() != null ? a.getDateRealisation() : a.getDatePrescription();
                    LocalDateTime db = b.getDateRealisation() != null ? b.getDateRealisation() : b.getDatePrescription();
                    if (da == null || db == null) return 0;
                    return db.compareTo(da);
                })
                .map(this::toExamenDto)
                .collect(Collectors.toList());
    }

    private Map<String, Object> toExamenDto(Examen e) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idExamen", e.getIdExamen());
        m.put("numeroExamen", e.getNumeroExamen());
        m.put("typeExamen", e.getTypeExamen());
        m.put("statut", e.getStatut() != null ? e.getStatut().name() : null);
        m.put("datePrescription", e.getDatePrescription());
        m.put("dateRealisation", e.getDateRealisation());
        m.put("laboratoire", e.getLaboratoire());
        m.put("resultat", e.getResultat());
        m.put("interpretation", e.getInterpretation());
        m.put("compteRendu", e.getCompteRendu());
        m.put("conclusion", e.getConclusion());
        return m;
    }

    // ==================== ORDONNANCES / CONSULTATIONS ====================

    public List<Map<String, Object>> getMesOrdonnances() {
        Integer idPatient = pid();
        return prescriptionRepository.findByIdPatient(idPatient, PageRequest.of(0, 200))
                .getContent().stream()
                .sorted((a, b) -> b.getDatePrescription().compareTo(a.getDatePrescription()))
                .map(this::toPrescriptionDto)
                .collect(Collectors.toList());
    }

    private Map<String, Object> toPrescriptionDto(Prescription p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idPrescription", p.getIdPrescription());
        m.put("numeroPrescription", p.getNumeroPrescription());
        m.put("datePrescription", p.getDatePrescription());
        m.put("typePrescription", p.getTypePrescription() != null ? p.getTypePrescription().name() : null);
        m.put("statut", p.getStatut() != null ? p.getStatut().name() : null);
        m.put("description", p.getDescription());
        m.put("instructions", p.getInstructions());
        m.put("medecinNom", p.getMedecin() != null
                ? "Dr. " + p.getMedecin().getPrenom() + " " + p.getMedecin().getNom() : null);
        return m;
    }

    public List<Map<String, Object>> getMesConsultations() {
        Integer idPatient = pid();
        return consultationRepository.findByPatient_IdPatient(idPatient).stream()
                .sorted((a, b) -> b.getDateConsultation().compareTo(a.getDateConsultation()))
                .map(this::toConsultationDto)
                .collect(Collectors.toList());
    }

    private Map<String, Object> toConsultationDto(Consultation c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idConsultation", c.getIdConsultation());
        m.put("dateConsultation", c.getDateConsultation());
        m.put("motifConsultation", c.getMotifConsultation());
        m.put("diagnostic", c.getDiagnostic());
        m.put("observations", c.getObservations());
        m.put("medecinNom", c.getMedecin() != null
                ? "Dr. " + c.getMedecin().getPrenom() + " " + c.getMedecin().getNom() : null);
        return m;
    }

    // ==================== FACTURES ====================

    public List<Map<String, Object>> getMesFactures() {
        Integer idPatient = pid();
        return factureRepository.findAll().stream()
                .filter(f -> idPatient.equals(f.getIdPatient()))
                .sorted((a, b) -> b.getDateEmission().compareTo(a.getDateEmission()))
                .map(this::toFactureDto)
                .collect(Collectors.toList());
    }

    private Map<String, Object> toFactureDto(Facture f) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("idFacture", f.getIdFacture());
        m.put("numeroFacture", f.getNumeroFacture());
        m.put("dateEmission", f.getDateEmission());
        m.put("dateEcheance", f.getDateEcheance());
        m.put("montantHt", f.getMontantHt());
        m.put("montantTtc", f.getMontantTtc());
        m.put("montantPaye", f.getMontantPaye());
        m.put("montantRestant", f.getMontantRestant());
        m.put("statut", f.getStatut() != null ? f.getStatut().name() : null);
        m.put("resteAChargePatient", f.getResteAChargePatient());
        m.put("details", f.getDetails() == null ? List.of() : f.getDetails().stream().map(d -> {
            Map<String, Object> dm = new LinkedHashMap<>();
            dm.put("description", d.getDescription());
            dm.put("quantite", d.getQuantite());
            dm.put("prixUnitaire", d.getPrixUnitaire());
            dm.put("montantHt", d.getMontantHt());
            return dm;
        }).collect(Collectors.toList()));
        return m;
    }
}
