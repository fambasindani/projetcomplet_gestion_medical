package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.Entity.InterventionUrgence;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import adc.gestion_hospitaliere.Repository.InterventionUrgenceRepository;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.dto.urgence.InterventionUrgenceRequestDto;
import adc.gestion_hospitaliere.dto.urgence.InterventionUrgenceResponseDto;
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
public class InterventionUrgenceService {

    private final InterventionUrgenceRepository interventionUrgenceRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    private String generateNumeroIntervention() {
        String prefix = "INTU-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-";
        String numero;
        do {
            numero = prefix + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        } while (interventionUrgenceRepository.existsByNumeroIntervention(numero));
        return numero;
    }

    public Page<InterventionUrgenceResponseDto> getAll(Pageable pageable) {
        return interventionUrgenceRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<InterventionUrgenceResponseDto> search(StatutInterventionUrgence statut, Integer idPatient,
                                                       Integer idMedecin, LocalDateTime dateStart, LocalDateTime dateEnd,
                                                       Pageable pageable) {
        return interventionUrgenceRepository.search(statut, idPatient, idMedecin, dateStart, dateEnd, pageable)
                .map(this::toResponseDto);
    }

    public List<InterventionUrgenceResponseDto> getByAdmission(Integer idAdmissionUrgence) {
        return interventionUrgenceRepository.findByIdAdmissionUrgence(idAdmissionUrgence)
                .stream()
                .map(this::toResponseDto)
                .toList();
    }

    public InterventionUrgenceResponseDto getById(Integer id) {
        InterventionUrgence i = interventionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention d'urgence non trouvée"));
        return toResponseDto(i);
    }

    @Transactional
    public InterventionUrgenceResponseDto create(InterventionUrgenceRequestDto dto) {
        InterventionUrgence i = new InterventionUrgence();

        String numero = dto.getNumeroIntervention();
        if (numero == null || numero.isBlank()) {
            numero = generateNumeroIntervention();
        }
        i.setNumeroIntervention(numero);

        updateEntity(i, dto);
        i = interventionUrgenceRepository.save(i);
        return toResponseDto(i);
    }

    @Transactional
    public InterventionUrgenceResponseDto update(Integer id, InterventionUrgenceRequestDto dto) {
        InterventionUrgence i = interventionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention d'urgence non trouvée"));
        updateEntity(i, dto);
        i = interventionUrgenceRepository.save(i);
        return toResponseDto(i);
    }

    @Transactional
    public InterventionUrgenceResponseDto changerStatut(Integer id, StatutInterventionUrgence nouveauStatut) {
        InterventionUrgence i = interventionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention d'urgence non trouvée"));
        i.setStatut(nouveauStatut);
        i = interventionUrgenceRepository.save(i);
        return toResponseDto(i);
    }

    @Transactional
    public void delete(Integer id) {
        InterventionUrgence i = interventionUrgenceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Intervention d'urgence non trouvée"));
        interventionUrgenceRepository.delete(i);
    }

    private void updateEntity(InterventionUrgence i, InterventionUrgenceRequestDto dto) {
        if (dto.getIdPatient() != null) {
            Patient p = patientRepository.findById(dto.getIdPatient())
                    .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
            i.setIdPatient(p.getIdPatient());
        }
        if (dto.getIdMedecinPrincipal() != null) {
            Medecin m = medecinRepository.findById(dto.getIdMedecinPrincipal())
                    .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
            i.setIdMedecinPrincipal(m.getIdMedecin());
        }
        i.setIdAdmissionUrgence(dto.getIdAdmissionUrgence());
        i.setTypeIntervention(dto.getTypeIntervention());
        i.setDateIntervention(dto.getDateIntervention());
        i.setLieu(dto.getLieu());
        i.setDureePrevue(dto.getDureePrevue());
        i.setActesRealises(dto.getActesRealises());
        i.setMaterielUtilise(dto.getMaterielUtilise());
        i.setComplications(dto.getComplications());
        i.setResultat(dto.getResultat());
        i.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutInterventionUrgence.Planifiee);
        i.setNotes(dto.getNotes());
    }

    private InterventionUrgenceResponseDto toResponseDto(InterventionUrgence i) {
        String patientNom = null, patientPrenom = null;
        if (i.getPatient() != null) {
            patientNom = i.getPatient().getNom();
            patientPrenom = i.getPatient().getPrenom();
        }
        String medecinNom = null, medecinPrenom = null;
        if (i.getMedecinPrincipal() != null) {
            medecinNom = i.getMedecinPrincipal().getNom();
            medecinPrenom = i.getMedecinPrincipal().getPrenom();
        }
        return InterventionUrgenceResponseDto.builder()
                .idInterventionUrgence(i.getIdInterventionUrgence())
                .numeroIntervention(i.getNumeroIntervention())
                .idPatient(i.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .idAdmissionUrgence(i.getIdAdmissionUrgence())
                .idMedecinPrincipal(i.getIdMedecinPrincipal())
                .medecinNom(medecinNom)
                .medecinPrenom(medecinPrenom)
                .typeIntervention(i.getTypeIntervention())
                .dateIntervention(i.getDateIntervention())
                .lieu(i.getLieu())
                .dureePrevue(i.getDureePrevue())
                .actesRealises(i.getActesRealises())
                .materielUtilise(i.getMaterielUtilise())
                .complications(i.getComplications())
                .resultat(i.getResultat())
                .statut(i.getStatut())
                .notes(i.getNotes())
                .dateCreation(i.getDateCreation())
                .build();
    }
}
