package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;


import adc.gestion_hospitaliere.Entity.Prescription;
import adc.gestion_hospitaliere.Entity.PrescriptionMedicament;
import adc.gestion_hospitaliere.Enums.StatutPrescription;
import adc.gestion_hospitaliere.Enums.TypePrescription;
import adc.gestion_hospitaliere.Repository.PrescriptionMedicamentRepository;
import adc.gestion_hospitaliere.Repository.PrescriptionRepository;
import adc.gestion_hospitaliere.dto.prescription.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PrescriptionMedicamentRepository prescriptionMedicamentRepository;

    private String generateNumeroPrescription() {
        String base = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMddHHmmss"));
        String numero;
        do {
            int random = ThreadLocalRandom.current().nextInt(1000);
            numero = "ORD-" + base + "-" + String.format("%03d", random);
        } while (prescriptionRepository.existsByNumeroPrescription(numero));
        return numero;
    }
// Exemple : ORD-2406171446-42 (14 caractères)

    public Page<PrescriptionResponseDto> getAll(Pageable pageable) {
        return prescriptionRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<PrescriptionResponseDto> getByPatient(Integer patientId, Pageable pageable) {
        return prescriptionRepository.findByIdPatient(patientId, pageable).map(this::toResponseDto);
    }

    public Page<PrescriptionResponseDto> getByMedecin(Integer medecinId, Pageable pageable) {
        return prescriptionRepository.findByIdMedecin(medecinId, pageable).map(this::toResponseDto);
    }

    public Page<PrescriptionResponseDto> getByType(TypePrescription type, Pageable pageable) {
        return prescriptionRepository.findByTypePrescription(type, pageable).map(this::toResponseDto);
    }

    public Page<PrescriptionResponseDto> search(TypePrescription type, StatutPrescription statut,
                                                Integer idPatient, LocalDateTime dateStart,
                                                LocalDateTime dateEnd, Pageable pageable) {
        return prescriptionRepository.search(type, statut, idPatient, dateStart, dateEnd, pageable)
                .map(this::toResponseDto);
    }

    public PrescriptionResponseDto getById(Integer id) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription non trouvée"));
        return toResponseDto(p);
    }

    public List<PrescriptionMedicamentResponseDto> getMedicamentsByPrescription(Integer prescriptionId) {
        return prescriptionMedicamentRepository.findByIdPrescription(prescriptionId).stream()
                .map(this::toMedicamentResponseDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public PrescriptionResponseDto create(PrescriptionRequestDto dto) {
        // 1. Créer la prescription
        Prescription p = new Prescription();
        String numero = (dto.getNumeroPrescription() == null || dto.getNumeroPrescription().isBlank())
                ? generateNumeroPrescription() : dto.getNumeroPrescription();
        p.setNumeroPrescription(numero);
        updateEntity(p, dto);
        p = prescriptionRepository.save(p);

        // 2. Sauvegarder les médicaments associés
        if (dto.getPrescriptionsMedicaments() != null) {
            for (PrescriptionMedicamentRequestDto medDto : dto.getPrescriptionsMedicaments()) {
                PrescriptionMedicament pm = new PrescriptionMedicament();
                pm.setIdPrescription(p.getIdPrescription());
                pm.setIdMedicament(medDto.getIdMedicament());
                pm.setIdLot(medDto.getIdLot());
                pm.setPosologie(medDto.getPosologie());
                pm.setDureeTraitement(medDto.getDureeTraitement());
                pm.setQuantitePrescrite(medDto.getQuantitePrescrite());
                pm.setInstructions(medDto.getInstructions());
                // Valeurs par défaut pour les champs NOT NULL
                pm.setRenouvelable(medDto.getRenouvelable() != null ? medDto.getRenouvelable() : false);
                pm.setNombreRenouvellements(medDto.getNombreRenouvellements() != null ? medDto.getNombreRenouvellements() : 0);
                pm.setQuantiteDelivree(medDto.getQuantiteDelivree() != null ? medDto.getQuantiteDelivree() : 0);
                pm.setDateDebut(medDto.getDateDebut());
                pm.setDateFin(medDto.getDateFin());
                prescriptionMedicamentRepository.save(pm);
            }
        }
        return toResponseDto(p);
    }

    @Transactional
    public PrescriptionResponseDto update(Integer id, PrescriptionRequestDto dto) {
        // 1. Mettre à jour la prescription
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription non trouvée"));
        updateEntity(p, dto);
        p = prescriptionRepository.save(p);

        // 2. Supprimer les anciens médicaments
        prescriptionMedicamentRepository.deleteByPrescriptionId(p.getIdPrescription());

        // 3. Recréer les nouveaux médicaments
        if (dto.getPrescriptionsMedicaments() != null) {
            for (PrescriptionMedicamentRequestDto medDto : dto.getPrescriptionsMedicaments()) {
                PrescriptionMedicament pm = new PrescriptionMedicament();
                pm.setIdPrescription(p.getIdPrescription());
                pm.setIdMedicament(medDto.getIdMedicament());
                pm.setIdLot(medDto.getIdLot());
                pm.setPosologie(medDto.getPosologie());
                pm.setDureeTraitement(medDto.getDureeTraitement());
                pm.setQuantitePrescrite(medDto.getQuantitePrescrite());
                pm.setInstructions(medDto.getInstructions());
                pm.setRenouvelable(medDto.getRenouvelable() != null ? medDto.getRenouvelable() : false);
                pm.setNombreRenouvellements(medDto.getNombreRenouvellements() != null ? medDto.getNombreRenouvellements() : 0);
                pm.setQuantiteDelivree(medDto.getQuantiteDelivree() != null ? medDto.getQuantiteDelivree() : 0);
                pm.setDateDebut(medDto.getDateDebut());
                pm.setDateFin(medDto.getDateFin());
                prescriptionMedicamentRepository.save(pm);
            }
        }
        return toResponseDto(p);
    }

    @Transactional
    public void annuler(Integer id, String motif) {
        Prescription p = prescriptionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Prescription non trouvée"));
        p.setStatut(StatutPrescription.Annulee);
        p.setMotifAnnulation(motif);
        p.setDateAnnulation(LocalDateTime.now());
        prescriptionRepository.save(p);
    }

    @Transactional
    public void delete(Integer id) {
        prescriptionMedicamentRepository.deleteByPrescriptionId(id);
        prescriptionRepository.deleteById(id);
    }

    private void updateEntity(Prescription p, PrescriptionRequestDto dto) {
        p.setIdConsultation(dto.getIdConsultation());
        p.setIdHospitalisation(dto.getIdHospitalisation());
        p.setIdMedecin(dto.getIdMedecin());
        p.setIdPatient(dto.getIdPatient());
        p.setDatePrescription(dto.getDatePrescription());
        p.setTypePrescription(dto.getTypePrescription());
        p.setDescription(dto.getDescription());
        p.setInstructions(dto.getInstructions());
        p.setUrgente(dto.getUrgente() != null ? dto.getUrgente() : false);
        p.setDateDebut(dto.getDateDebut());
        p.setDateFin(dto.getDateFin());
        p.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutPrescription.Active);
        p.setMotifAnnulation(dto.getMotifAnnulation());
        p.setNotesComplementaires(dto.getNotesComplementaires());
    }

    private PrescriptionResponseDto toResponseDto(Prescription p) {
        String medecinNom = null, medecinPrenom = null;
        if (p.getMedecin() != null) {
            medecinNom = p.getMedecin().getNom();
            medecinPrenom = p.getMedecin().getPrenom();
        }
        String patientNom = null, patientPrenom = null;
        if (p.getPatient() != null) {
            patientNom = p.getPatient().getNom();
            patientPrenom = p.getPatient().getPrenom();
        }
        List<PrescriptionMedicamentResponseDto> medicaments = prescriptionMedicamentRepository.findByIdPrescription(p.getIdPrescription())
                .stream().map(this::toMedicamentResponseDto).collect(Collectors.toList());

        return PrescriptionResponseDto.builder()
                .idPrescription(p.getIdPrescription())
                .numeroPrescription(p.getNumeroPrescription())
                .idConsultation(p.getIdConsultation())
                .idHospitalisation(p.getIdHospitalisation())
                .idMedecin(p.getIdMedecin())
                .medecinNom(medecinNom)
                .medecinPrenom(medecinPrenom)
                .idPatient(p.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .datePrescription(p.getDatePrescription())
                .typePrescription(p.getTypePrescription())
                .description(p.getDescription())
                .instructions(p.getInstructions())
                .urgente(p.getUrgente())
                .dateDebut(p.getDateDebut())
                .dateFin(p.getDateFin())
                .statut(p.getStatut())
                .dateAnnulation(p.getDateAnnulation())
                .motifAnnulation(p.getMotifAnnulation())
                .notesComplementaires(p.getNotesComplementaires())
                .prescriptionsMedicaments(medicaments)
                .build();
    }

    private PrescriptionMedicamentResponseDto toMedicamentResponseDto(PrescriptionMedicament pm) {
        return PrescriptionMedicamentResponseDto.builder()
                .idPrescriptionMed(pm.getIdPrescriptionMed())
                .idMedicament(pm.getIdMedicament())
                .medicamentNom(pm.getMedicament() != null ? pm.getMedicament().getNomCommercial() : null)
                .idLot(pm.getIdLot())
                .posologie(pm.getPosologie())
                .dureeTraitement(pm.getDureeTraitement())
                .quantitePrescrite(pm.getQuantitePrescrite())
                .quantiteDelivree(pm.getQuantiteDelivree())
                .instructions(pm.getInstructions())
                .renouvelable(pm.getRenouvelable())
                .nombreRenouvellements(pm.getNombreRenouvellements())
                .dateDebut(pm.getDateDebut())
                .dateFin(pm.getDateFin())
                .build();
    }
}