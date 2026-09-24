package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.Entity.AdmissionUrgence;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Enums.GraviteUrgence;
import adc.gestion_hospitaliere.Enums.StatutAdmissionUrgence;
import adc.gestion_hospitaliere.Repository.AdmissionUrgenceRepository;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.dto.urgence.AdmissionUrgenceRequestDto;
import adc.gestion_hospitaliere.dto.urgence.AdmissionUrgenceResponseDto;
import adc.gestion_hospitaliere.util.TransitionsStatut;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class AdmissionUrgenceService {

    private final AdmissionUrgenceRepository admissionUrgenceRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    private String generateNumeroAdmission() {
        String prefix = "URG-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-";
        String numero;
        do {
            numero = prefix + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        } while (admissionUrgenceRepository.existsByNumeroAdmission(numero));
        return numero;
    }

    public Page<AdmissionUrgenceResponseDto> getAll(Pageable pageable) {
        return admissionUrgenceRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<AdmissionUrgenceResponseDto> search(StatutAdmissionUrgence statut, GraviteUrgence gravite,
                                                    Integer idPatient, Integer idMedecin,
                                                    LocalDateTime dateStart, LocalDateTime dateEnd,
                                                    Pageable pageable) {
        return admissionUrgenceRepository.search(statut, gravite, idPatient, idMedecin, dateStart, dateEnd, pageable)
                .map(this::toResponseDto);
    }

    public List<AdmissionUrgenceResponseDto> getSalleAttente() {
        return admissionUrgenceRepository
                .findSalleAttente(StatutAdmissionUrgence.En_attente)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public AdmissionUrgenceResponseDto getById(Integer id) {
        AdmissionUrgence a = admissionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission aux urgences non trouvée"));
        return toResponseDto(a);
    }

    @Transactional
    public AdmissionUrgenceResponseDto create(AdmissionUrgenceRequestDto dto) {
        AdmissionUrgence a = new AdmissionUrgence();

        String numero = dto.getNumeroAdmission();
        if (numero == null || numero.isBlank()) {
            numero = generateNumeroAdmission();
        }
        a.setNumeroAdmission(numero);

        updateEntity(a, dto);
        a = admissionUrgenceRepository.save(a);
        return toResponseDto(a);
    }

    @Transactional
    public AdmissionUrgenceResponseDto update(Integer id, AdmissionUrgenceRequestDto dto) {
        AdmissionUrgence a = admissionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission aux urgences non trouvée"));
        updateEntity(a, dto);
        a = admissionUrgenceRepository.save(a);
        return toResponseDto(a);
    }

    @Transactional
    public AdmissionUrgenceResponseDto changerStatut(Integer id, StatutAdmissionUrgence nouveauStatut) {
        AdmissionUrgence a = admissionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission aux urgences non trouvée"));
        TransitionsStatut.verifierAdmissionUrgence(a.getStatut(), nouveauStatut);
        a.setStatut(nouveauStatut);
        if (nouveauStatut == StatutAdmissionUrgence.En_consultation && a.getDatePriseEnCharge() == null) {
            a.setDatePriseEnCharge(LocalDateTime.now());
        }
        a = admissionUrgenceRepository.save(a);
        return toResponseDto(a);
    }

    @Transactional
    public void delete(Integer id) {
        AdmissionUrgence a = admissionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admission aux urgences non trouvée"));
        admissionUrgenceRepository.delete(a);
    }

    private void updateEntity(AdmissionUrgence a, AdmissionUrgenceRequestDto dto) {
        if (dto.getIdPatient() != null) {
            Patient p = patientRepository.findById(dto.getIdPatient())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
            a.setIdPatient(p.getIdPatient());
        }
        if (dto.getIdMedecin() != null) {
            Medecin m = medecinRepository.findById(dto.getIdMedecin())
                    .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
            a.setIdMedecin(m.getIdMedecin());
        } else {
            a.setIdMedecin(null);
        }
        a.setDateArrivee(dto.getDateArrivee());
        a.setMotifUrgent(dto.getMotifUrgent());
        a.setGravite(dto.getGravite() != null ? dto.getGravite() : GraviteUrgence.Non_urgente);
        a.setSymptomes(dto.getSymptomes());
        a.setTensionArterielle(dto.getTensionArterielle());
        a.setPouls(dto.getPouls());
        a.setTemperature(dto.getTemperature());
        a.setSaturationOxygene(dto.getSaturationOxygene());
        a.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutAdmissionUrgence.En_attente);
        a.setDatePriseEnCharge(dto.getDatePriseEnCharge());
        a.setOrientation(dto.getOrientation());
        a.setNotes(dto.getNotes());
    }

    private AdmissionUrgenceResponseDto toResponseDto(AdmissionUrgence a) {
        String patientNom = null, patientPrenom = null;
        if (a.getPatient() != null) {
            patientNom = a.getPatient().getNom();
            patientPrenom = a.getPatient().getPrenom();
        }
        String medecinNom = null, medecinPrenom = null;
        if (a.getMedecin() != null) {
            medecinNom = a.getMedecin().getNom();
            medecinPrenom = a.getMedecin().getPrenom();
        }
        return AdmissionUrgenceResponseDto.builder()
                .idAdmissionUrgence(a.getIdAdmissionUrgence())
                .numeroAdmission(a.getNumeroAdmission())
                .idPatient(a.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .idMedecin(a.getIdMedecin())
                .medecinNom(medecinNom)
                .medecinPrenom(medecinPrenom)
                .dateArrivee(a.getDateArrivee())
                .motifUrgent(a.getMotifUrgent())
                .gravite(a.getGravite())
                .symptomes(a.getSymptomes())
                .tensionArterielle(a.getTensionArterielle())
                .pouls(a.getPouls())
                .temperature(a.getTemperature())
                .saturationOxygene(a.getSaturationOxygene())
                .statut(a.getStatut())
                .datePriseEnCharge(a.getDatePriseEnCharge())
                .orientation(a.getOrientation())
                .notes(a.getNotes())
                .dateCreation(a.getDateCreation())
                .build();
    }
}
