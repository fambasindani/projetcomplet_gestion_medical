package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;

import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.GroupeSanguin;
import adc.gestion_hospitaliere.Enums.SituationFamiliale;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.dto.patient.PatientRequestDto;
import adc.gestion_hospitaliere.dto.patient.PatientResponseDto;
import adc.gestion_hospitaliere.dto.patient.PatientUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PatientService {

    private final PatientRepository patientRepository;

    public Page<PatientResponseDto> getAllPatients(Pageable pageable) {
        return patientRepository.findAll(pageable)
                .map(this::convertToResponseDto);
    }

    public PatientResponseDto getPatientById(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
        return convertToResponseDto(patient);
    }

    @Transactional
    public PatientResponseDto createPatient(PatientRequestDto dto) {
        if (patientRepository.existsByNumeroSecuriteSociale(dto.getNumeroSecuriteSociale()))
            throw new BusinessException("Numéro sécurité sociale déjà existant");
        if (dto.getEmail() != null && patientRepository.existsByEmail(dto.getEmail()))
            throw new BusinessException("Email déjà existant");

        Patient patient = Patient.builder()
                .numeroSecuriteSociale(dto.getNumeroSecuriteSociale())
                .nom(dto.getNom()).prenom(dto.getPrenom())
                .dateNaissance(dto.getDateNaissance()).lieuNaissance(dto.getLieuNaissance())
                .genre(dto.getGenre()).telephone(dto.getTelephone())
                .telephoneUrgent(dto.getTelephoneUrgent()).email(dto.getEmail())
                .adresse(dto.getAdresse()).profession(dto.getProfession())
                .situationFamiliale(dto.getSituationFamiliale()).groupeSanguin(dto.getGroupeSanguin())
                .allergies(dto.getAllergies()).antecedentsMedicaux(dto.getAntecedentsMedicaux())
                .antecedentsChirurgicaux(dto.getAntecedentsChirurgicaux())
                .traitementHabituel(dto.getTraitementHabituel()).mutuelle(dto.getMutuelle())
                .numeroMutuelle(dto.getNumeroMutuelle())
                .personneContactNom(dto.getPersonneContactNom()).personneContactLien(dto.getPersonneContactLien())
                .personneContactTelephone(dto.getPersonneContactTelephone())
                .dateEnregistrement(LocalDateTime.now())
                .consentement(dto.getConsentement() != null ? dto.getConsentement() : true)
                .build();
        return convertToResponseDto(patientRepository.save(patient));
    }

    @Transactional
    public PatientResponseDto updatePatient(Integer id, PatientUpdateDto dto) {
        if (!id.equals(dto.getIdPatient()))
            throw new BusinessException("ID mismatch");
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));

        if (patientRepository.existsByNumeroSecuriteSocialeAndIdPatientNot(dto.getNumeroSecuriteSociale(), id))
            throw new BusinessException("Numéro sécurité sociale déjà utilisé par un autre patient");
        if (dto.getEmail() != null && patientRepository.existsByEmailAndIdPatientNot(dto.getEmail(), id))
            throw new BusinessException("Email déjà utilisé par un autre patient");

        patient.setNumeroSecuriteSociale(dto.getNumeroSecuriteSociale());
        patient.setNom(dto.getNom()); patient.setPrenom(dto.getPrenom());
        patient.setDateNaissance(dto.getDateNaissance()); patient.setLieuNaissance(dto.getLieuNaissance());
        patient.setGenre(dto.getGenre()); patient.setTelephone(dto.getTelephone());
        patient.setTelephoneUrgent(dto.getTelephoneUrgent()); patient.setEmail(dto.getEmail());
        patient.setAdresse(dto.getAdresse()); patient.setProfession(dto.getProfession());
        patient.setSituationFamiliale(dto.getSituationFamiliale()); patient.setGroupeSanguin(dto.getGroupeSanguin());
        patient.setAllergies(dto.getAllergies()); patient.setAntecedentsMedicaux(dto.getAntecedentsMedicaux());
        patient.setAntecedentsChirurgicaux(dto.getAntecedentsChirurgicaux());
        patient.setTraitementHabituel(dto.getTraitementHabituel()); patient.setMutuelle(dto.getMutuelle());
        patient.setNumeroMutuelle(dto.getNumeroMutuelle());
        patient.setPersonneContactNom(dto.getPersonneContactNom()); patient.setPersonneContactLien(dto.getPersonneContactLien());
        patient.setPersonneContactTelephone(dto.getPersonneContactTelephone());
        patient.setConsentement(dto.getConsentement());

        return convertToResponseDto(patientRepository.save(patient));
    }

    @Transactional
    public void deletePatient(Integer id) {
        if (!patientRepository.existsById(id)) throw new ResourceNotFoundException("Patient non trouvé");
        patientRepository.deleteById(id);
    }

    public Page<PatientResponseDto> searchPatients(String term, Pageable pageable) {
        return patientRepository.searchByTerm(term, pageable)
                .map(this::convertToResponseDto);
    }

    public Page<PatientResponseDto> getPatientsByGenre(Genre genre, Pageable pageable) {
        return patientRepository.findByGenre(genre, pageable)
                .map(this::convertToResponseDto);
    }

    public Map<String, Object> getStatistiques() {
        long totalPatients = patientRepository.count();
        long patientsRecents = patientRepository.countByDateEnregistrementAfter(LocalDateTime.now().minusDays(30));

        // Par genre
        List<Map<String, Object>> parGenre = Arrays.stream(Genre.values())
                .map(g -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("genre", g.name());
                    item.put("nombre", patientRepository.countByGenre(g));
                    return item;
                })
                .collect(Collectors.toList());

        // Par groupe sanguin
        // Assurez-vous que countByGroupeSanguin existe dans le repository
        List<Map<String, Object>> parGroupeSanguin = Arrays.stream(GroupeSanguin.values())
                .map(gs -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("groupeSanguin", gs.name());
                    item.put("nombre", patientRepository.countByGroupeSanguin(gs));
                    return item;
                })
                .collect(Collectors.toList());

        // Par situation familiale
        List<Map<String, Object>> parSituationFamiliale = Arrays.stream(SituationFamiliale.values())
                .map(sf -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("situationFamiliale", sf.name());
                    item.put("nombre", patientRepository.countBySituationFamiliale(sf));
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalPatients", totalPatients);
        result.put("patientsRecents", patientsRecents);
        result.put("parGenre", parGenre);
        result.put("parGroupeSanguin", parGroupeSanguin);
        result.put("parSituationFamiliale", parSituationFamiliale);

        return result;
    }
    public Map<String, Object> getPatientDetails(Integer id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
        Map<String, Object> details = new LinkedHashMap<>();
        details.put("informationsPersonnelles", convertToResponseDto(patient));
        details.put("rendezVous", List.of()); // à compléter si relations existent
        details.put("consultations", List.of());
        details.put("hospitalisations", List.of());
        return details;
    }

    private PatientResponseDto convertToResponseDto(Patient p) {
        return PatientResponseDto.builder()
                .idPatient(p.getIdPatient())
                .numeroSecuriteSociale(p.getNumeroSecuriteSociale())
                .nom(p.getNom()).prenom(p.getPrenom())
                .dateNaissance(p.getDateNaissance()).lieuNaissance(p.getLieuNaissance())
                .genre(p.getGenre()).telephone(p.getTelephone())
                .telephoneUrgent(p.getTelephoneUrgent()).email(p.getEmail())
                .adresse(p.getAdresse()).profession(p.getProfession())
                .situationFamiliale(p.getSituationFamiliale()).groupeSanguin(p.getGroupeSanguin())
                .allergies(p.getAllergies()).antecedentsMedicaux(p.getAntecedentsMedicaux())
                .antecedentsChirurgicaux(p.getAntecedentsChirurgicaux())
                .traitementHabituel(p.getTraitementHabituel())
                .mutuelle(p.getMutuelle()).numeroMutuelle(p.getNumeroMutuelle())
                .personneContactNom(p.getPersonneContactNom())
                .personneContactLien(p.getPersonneContactLien())
                .personneContactTelephone(p.getPersonneContactTelephone())
                .dateEnregistrement(p.getDateEnregistrement())
                .consentement(p.getConsentement())
                .build();
    }
}