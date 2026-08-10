package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;



import adc.gestion_hospitaliere.Entity.SoinPrescrit;
import adc.gestion_hospitaliere.Enums.StatutSoin;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.Repository.SoinPrescritRepository;
import adc.gestion_hospitaliere.dto.SoinPrescrit.SoinPrescritRequestDto;
import adc.gestion_hospitaliere.dto.SoinPrescrit.SoinPrescritResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SoinPrescritService {

    private final SoinPrescritRepository repository;
    private final PatientRepository patientRepository;
    private final PersonnelRepository personnelRepository;

    public List<SoinPrescritResponseDto> getByPrescription(Integer prescriptionId) {
        return repository.findByIdPrescription(prescriptionId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    public SoinPrescritResponseDto getById(Integer id) {
        return toDto(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soin non trouvé")));
    }

    @Transactional
    public SoinPrescritResponseDto create(SoinPrescritRequestDto dto) {
        SoinPrescrit soin = SoinPrescrit.builder()
                .idPrescription(dto.getIdPrescription())
                .idPatient(dto.getIdPatient())
                .idInfirmier(dto.getIdInfirmier())
                .description(dto.getDescription())
                .instructions(dto.getInstructions())
                .frequence(dto.getFrequence())
                .duree(dto.getDuree())
                .statut(dto.getStatut() != null ? dto.getStatut() : StatutSoin.Prescrit)
                .datePrescription(LocalDateTime.now())
                .build();
        return toDto(repository.save(soin));
    }

    @Transactional
    public SoinPrescritResponseDto update(Integer id, SoinPrescritRequestDto dto) {
        SoinPrescrit soin = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soin non trouvé"));
        soin.setIdInfirmier(dto.getIdInfirmier());
        soin.setDescription(dto.getDescription());
        soin.setInstructions(dto.getInstructions());
        soin.setFrequence(dto.getFrequence());
        soin.setDuree(dto.getDuree());
        soin.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutSoin.Prescrit);
        return toDto(repository.save(soin));
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    private SoinPrescritResponseDto toDto(SoinPrescrit soin) {
        String patientNom = patientRepository.findById(soin.getIdPatient())
                .map(p -> p.getNom() + " " + p.getPrenom()).orElse(null);
        String infirmierNom = soin.getIdInfirmier() != null ?
                personnelRepository.findById(soin.getIdInfirmier())
                        .map(p -> p.getNom() + " " + p.getPrenom()).orElse(null) : null;

        return SoinPrescritResponseDto.builder()
                .idSoin(soin.getIdSoin())
                .idPrescription(soin.getIdPrescription())
                .idPatient(soin.getIdPatient())
                .patientNom(patientNom)
                .idInfirmier(soin.getIdInfirmier())
                .infirmierNom(infirmierNom)
                .description(soin.getDescription())
                .instructions(soin.getInstructions())
                .frequence(soin.getFrequence())
                .duree(soin.getDuree())
                .statut(soin.getStatut())
                .datePrescription(soin.getDatePrescription())
                .build();
    }
}
