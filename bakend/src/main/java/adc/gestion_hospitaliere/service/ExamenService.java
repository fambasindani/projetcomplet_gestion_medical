package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;


import adc.gestion_hospitaliere.Entity.*;
import adc.gestion_hospitaliere.Enums.ConfidentialiteExamen;
import adc.gestion_hospitaliere.Entity.CategorieExamen;
import adc.gestion_hospitaliere.Enums.StatutExamen;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.examen.ExamenRequestDto;
import adc.gestion_hospitaliere.dto.examen.ExamenResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ExamenService {

    private final ExamenRepository examenRepository;
    private final CategorieExamenRepository categorieExamenRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    // --- CRUD ---

    public List<ExamenResponseDto> getExamensByStatut(StatutExamen statut) {
        return examenRepository.findByStatut(statut, Pageable.unpaged())
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    public Page<ExamenResponseDto> getAll(Pageable pageable) {
        return examenRepository.findAll(pageable).map(this::toDto);
    }

    public ExamenResponseDto getById(Integer id) {
        return toDto(examenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examen non trouvé")));
    }

    @Transactional
    public List<ExamenResponseDto> createBatch(List<ExamenRequestDto> dtos) {
        return dtos.stream().map(this::create).collect(Collectors.toList());
    }

    public List<ExamenResponseDto> getExamensByPrescription(Integer prescriptionId) {
        return examenRepository.findByIdPrescription(prescriptionId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ExamenResponseDto create(ExamenRequestDto dto) {
        CategorieExamen categorie = categorieExamenRepository.findById(dto.getIdCategorieExamen())
                .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée"));

        String numeroExamen;
        do {
            String base = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
            numeroExamen = "EX-" + base + "-" + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
        } while (examenRepository.existsByNumeroExamen(numeroExamen));

        Examen examen = Examen.builder()
                .numeroExamen(numeroExamen)
                .idPatient(dto.getIdPatient())
                .idMedecinPrescripteur(dto.getIdMedecinPrescripteur())
                .idPrescription(dto.getIdPrescription())
                .typeExamen(dto.getTypeExamen())
                .categorie(categorie)
                .datePrescription(dto.getDatePrescription() != null ? dto.getDatePrescription() : LocalDateTime.now())
                .datePlanification(dto.getDatePlanification())
                .dateRealisation(dto.getDateRealisation())
                .laboratoire(dto.getLaboratoire())
                .technicien(dto.getTechnicien())
                .resultat(dto.getResultat())
                .interpretation(dto.getInterpretation())
                .fichierJoint(dto.getFichierJoint())
                .compteRendu(dto.getCompteRendu())
                .anomalies(dto.getAnomalies())
                .conclusion(dto.getConclusion())
                .statut(dto.getStatut() != null ? dto.getStatut() : StatutExamen.Prescrit)
                .confidentialite(dto.getConfidentialite() != null ? dto.getConfidentialite() : ConfidentialiteExamen.Normal)
                .build();

        return toDto(examenRepository.save(examen));
    }

    @Transactional
    public ExamenResponseDto update(Integer id, ExamenRequestDto dto) {
        Examen examen = examenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examen non trouvé"));

        if (dto.getIdCategorieExamen() != null) {
            CategorieExamen categorie = categorieExamenRepository.findById(dto.getIdCategorieExamen())
                    .orElseThrow(() -> new ResourceNotFoundException("Catégorie non trouvée"));
            examen.setCategorie(categorie);
        }
        // Mise à jour des autres champs...
        examen.setTypeExamen(dto.getTypeExamen());
        examen.setDatePlanification(dto.getDatePlanification());
        examen.setDateRealisation(dto.getDateRealisation());
        examen.setLaboratoire(dto.getLaboratoire());
        examen.setTechnicien(dto.getTechnicien());
        examen.setResultat(dto.getResultat());
        examen.setInterpretation(dto.getInterpretation());
        examen.setFichierJoint(dto.getFichierJoint());
        examen.setCompteRendu(dto.getCompteRendu());
        examen.setAnomalies(dto.getAnomalies());
        examen.setConclusion(dto.getConclusion());
        if (dto.getStatut() != null) examen.setStatut(dto.getStatut());
        if (dto.getConfidentialite() != null) examen.setConfidentialite(dto.getConfidentialite());

        return toDto(examenRepository.save(examen));
    }

    @Transactional
    public void delete(Integer id) {
        examenRepository.deleteById(id);
    }

    // --- Méthodes pour l’impression (fournissent les données pour react-pdf) ---

    public List<ExamenResponseDto> getExamensByPatient(Integer patientId) {
        return examenRepository.findByIdPatient(patientId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ExamenResponseDto> getExamensByMedecin(Integer medecinId) {
        return examenRepository.findByIdMedecinPrescripteur(medecinId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    // --- Conversion ---

    private ExamenResponseDto toDto(Examen examen) {
        String patientNom = patientRepository.findById(examen.getIdPatient())
                .map(p -> p.getNom() + " " + p.getPrenom()).orElse("Inconnu");
        String medecinNom = medecinRepository.findById(examen.getIdMedecinPrescripteur())
                .map(Medecin::getNom).orElse("Inconnu");
        String validateurNom = examen.getValidePar() != null ?
                medecinRepository.findById(examen.getValidePar()).map(Medecin::getNom).orElse(null) : null;

        return ExamenResponseDto.builder()
                .idExamen(examen.getIdExamen())
                .numeroExamen(examen.getNumeroExamen())
                .idPrescription(examen.getIdPrescription())
                .idPatient(examen.getIdPatient())
                .patientNom(patientNom)
                .idMedecinPrescripteur(examen.getIdMedecinPrescripteur())
                .medecinNom(medecinNom)
                .typeExamen(examen.getTypeExamen())
                .idCategorieExamen(examen.getCategorie() != null ? examen.getCategorie().getIdCategorieExamen() : null)
                .libelleCategorie(examen.getCategorie() != null ? examen.getCategorie().getLibelle() : null)
                .datePrescription(examen.getDatePrescription())
                .datePlanification(examen.getDatePlanification())
                .dateRealisation(examen.getDateRealisation())
                .laboratoire(examen.getLaboratoire())
                .technicien(examen.getTechnicien())
                .resultat(examen.getResultat())
                .interpretation(examen.getInterpretation())
                .fichierJoint(examen.getFichierJoint())
                .compteRendu(examen.getCompteRendu())
                .anomalies(examen.getAnomalies())
                .conclusion(examen.getConclusion())
                .statut(examen.getStatut())
                .dateValidation(examen.getDateValidation())
                .validePar(examen.getValidePar())
                .validateurNom(validateurNom)
                .confidentialite(examen.getConfidentialite())
                .build();
    }
}