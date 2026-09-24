package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;


import adc.gestion_hospitaliere.Entity.Hospitalisation;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Entity.SoinInfirmier;
import adc.gestion_hospitaliere.Repository.HospitalisationRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.Repository.SoinInfirmierRepository;
import adc.gestion_hospitaliere.Repository.ActeCatalogueRepository;
import adc.gestion_hospitaliere.dto.soin.SoinInfirmierRequestDto;
import adc.gestion_hospitaliere.dto.soin.SoinInfirmierResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;





@Service
@RequiredArgsConstructor
public class SoinInfirmierService {
    private final SoinInfirmierRepository repository;
    private final HospitalisationRepository hospitalisationRepository;
    private final PatientRepository patientRepository;
    private final PersonnelRepository personnelRepository;
    private final ActeCatalogueRepository acteCatalogueRepository;

    public List<SoinInfirmierResponseDto> getByHospitalisation(Integer hospitalisationId) {
        return repository.findByIdHospitalisation(hospitalisationId)
                .stream().map(this::toDto)
                .collect(Collectors.toList());
    }

    public Page<SoinInfirmierResponseDto> search(String typeSoin, Integer idHospitalisation,
                                                 Integer idInfirmier, LocalDateTime dateStart,
                                                 LocalDateTime dateEnd, Pageable pageable) {
        return repository.search(typeSoin, idHospitalisation, idInfirmier, dateStart, dateEnd, pageable)
                .map(this::toDto);
    }

    public SoinInfirmierResponseDto getById(Integer id) {
        return toDto(repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soin non trouvé")));
    }

    @Transactional
    public SoinInfirmierResponseDto create(SoinInfirmierRequestDto dto) {
        hospitalisationRepository.findById(dto.getIdHospitalisation())
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalisation non trouvée"));
        if (dto.getIdActeCatalogue() != null) {
            acteCatalogueRepository.findById(dto.getIdActeCatalogue())
                    .orElseThrow(() -> new ResourceNotFoundException("Acte du référentiel non trouvé"));
        }

        SoinInfirmier soin = SoinInfirmier.builder()
                .idHospitalisation(dto.getIdHospitalisation())
                .idInfirmier(dto.getIdInfirmier())
                .idActeCatalogue(dto.getIdActeCatalogue())
                .dateSoin(dto.getDateSoin())
                .typeSoin(dto.getTypeSoin())
                .description(dto.getDescription())
                .observations(dto.getObservations())
                .signatureInfirmier(dto.getSignatureInfirmier() != null && dto.getSignatureInfirmier())
                .build();
        return toDto(repository.save(soin));
    }

    @Transactional
    public SoinInfirmierResponseDto update(Integer id, SoinInfirmierRequestDto dto) {
        SoinInfirmier soin = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Soin non trouvé"));
        soin.setIdHospitalisation(dto.getIdHospitalisation());
        soin.setIdInfirmier(dto.getIdInfirmier());
        soin.setDateSoin(dto.getDateSoin());
        soin.setTypeSoin(dto.getTypeSoin());
        if (dto.getIdActeCatalogue() != null) {
            acteCatalogueRepository.findById(dto.getIdActeCatalogue())
                    .orElseThrow(() -> new ResourceNotFoundException("Acte du référentiel non trouvé"));
            soin.setIdActeCatalogue(dto.getIdActeCatalogue());
        }
        soin.setDescription(dto.getDescription());
        soin.setObservations(dto.getObservations());
        soin.setSignatureInfirmier(dto.getSignatureInfirmier() != null && dto.getSignatureInfirmier());
        return toDto(repository.save(soin));
    }

    @Transactional
    public void delete(Integer id) {
        repository.deleteById(id);
    }

    private SoinInfirmierResponseDto toDto(SoinInfirmier soin) {
        String patientNom = hospitalisationRepository.findById(soin.getIdHospitalisation())
                .flatMap(h -> patientRepository.findById(h.getIdPatient()))
                .map(p -> p.getNom() + " " + p.getPrenom())
                .orElse(null);

        String infirmierNom = personnelRepository.findById(soin.getIdInfirmier())
                .map(p -> p.getNom() + " " + p.getPrenom())
                .orElse(null);

        return SoinInfirmierResponseDto.builder()
                .idSoin(soin.getIdSoin())
                .idHospitalisation(soin.getIdHospitalisation())
                .patientNom(patientNom)
                .idInfirmier(soin.getIdInfirmier())
                .infirmierNom(infirmierNom)
                .dateSoin(soin.getDateSoin())
                .typeSoin(soin.getTypeSoin())
                .idActeCatalogue(soin.getIdActeCatalogue())
                .libelleActeCatalogue(soin.getActeCatalogue() != null ? soin.getActeCatalogue().getLibelle() : null)
                .prixActeCatalogue(soin.getActeCatalogue() != null ? soin.getActeCatalogue().getPrixDefaut().doubleValue() : null)
                .description(soin.getDescription())
                .observations(soin.getObservations())
                .signatureInfirmier(soin.getSignatureInfirmier())
                .build();
    }
}