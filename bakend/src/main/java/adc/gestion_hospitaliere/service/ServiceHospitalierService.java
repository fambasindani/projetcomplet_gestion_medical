package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Entity.PersonnelService;
import adc.gestion_hospitaliere.Entity.ServiceHospitalier;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.Repository.PersonnelServiceRepository;
import adc.gestion_hospitaliere.Repository.ServiceHospitalierRepository;
import adc.gestion_hospitaliere.dto.service.*;
import adc.gestion_hospitaliere.exception.BusinessException;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceHospitalierService {

    private final ServiceHospitalierRepository serviceRepository;
    private final PersonnelServiceRepository personnelServiceRepository;
    private final PersonnelRepository personnelRepository;

    @Transactional(readOnly = true)
    public List<ServiceResponseDto> findAll(boolean actifsSeulement) {
        List<ServiceHospitalier> list = actifsSeulement
                ? serviceRepository.findAll().stream().filter(s -> Boolean.TRUE.equals(s.getActif())).collect(Collectors.toList())
                : serviceRepository.findAll();
        return list.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<ServiceResponseDto> search(
            Boolean actif, String term, org.springframework.data.domain.Pageable pageable) {
        String t = (term == null || term.isBlank()) ? null : term.trim();
        return serviceRepository.search(actif, t, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public ServiceResponseDto findById(Integer id) {
        ServiceHospitalier s = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable : " + id));
        return toDto(s);
    }

    @Transactional
    public ServiceResponseDto create(ServiceRequestDto dto) {
        if (serviceRepository.existsByNomIgnoreCase(dto.getNom())) {
            throw new BusinessException("Un service porte déjà ce nom");
        }
        ServiceHospitalier s = ServiceHospitalier.builder()
                .nom(dto.getNom()).pole(dto.getPole()).type(dto.getType())
                .responsable(dto.getResponsable())
                .actif(dto.getActif() == null ? true : dto.getActif())
                .build();
        serviceRepository.save(s);
        return toDto(s);
    }

    @Transactional
    public ServiceResponseDto update(Integer id, ServiceRequestDto dto) {
        ServiceHospitalier s = serviceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable : " + id));
        s.setNom(dto.getNom()); s.setPole(dto.getPole()); s.setType(dto.getType());
        s.setResponsable(dto.getResponsable());
        if (dto.getActif() != null) s.setActif(dto.getActif());
        serviceRepository.save(s);
        return toDto(s);
    }

    @Transactional
    public void delete(Integer id) {
        if (!serviceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Service introuvable : " + id);
        }
        personnelServiceRepository.findByIdService(id).forEach(personnelServiceRepository::delete);
        serviceRepository.deleteById(id);
    }

    @Transactional
    public ServiceResponseDto affecter(AffectationServiceDto dto) {
        serviceRepository.findById(dto.getIdService())
                .orElseThrow(() -> new ResourceNotFoundException("Service introuvable"));
        personnelRepository.findById(dto.getIdPersonnel())
                .orElseThrow(() -> new ResourceNotFoundException("Personnel introuvable"));
        personnelServiceRepository.deleteByIdPersonnel(dto.getIdPersonnel());
        personnelServiceRepository.save(PersonnelService.builder()
                .idPersonnel(dto.getIdPersonnel())
                .idService(dto.getIdService())
                .build());
        return findById(dto.getIdService());
    }

    @Transactional
    public void retirerAffectation(Integer idPersonnel) {
        personnelServiceRepository.deleteByIdPersonnel(idPersonnel);
    }

    private ServiceResponseDto toDto(ServiceHospitalier s) {
        List<PersonnelService> liens = personnelServiceRepository.findByIdService(s.getIdService());
        List<Integer> ids = liens.stream().map(PersonnelService::getIdPersonnel).collect(Collectors.toList());
        Map<Integer, Personnel> personnes = ids.isEmpty() ? Map.of()
                : personnelRepository.findAllById(ids).stream()
                    .collect(Collectors.toMap(Personnel::getIdPersonnel, Function.identity()));
        List<PersonnelServiceDto> personnel = liens.stream()
                .map(l -> personnes.get(l.getIdPersonnel()))
                .filter(java.util.Objects::nonNull)
                .map(p -> new PersonnelServiceDto(p.getIdPersonnel(),
                        (p.getPrenom() == null ? "" : p.getPrenom() + " ") + (p.getNom() == null ? "" : p.getNom()),
                        p.getFonction()))
                .collect(Collectors.toList());
        return ServiceResponseDto.builder()
                .idService(s.getIdService()).nom(s.getNom()).pole(s.getPole()).type(s.getType())
                .responsable(s.getResponsable()).actif(s.getActif())
                .dateCreation(s.getDateCreation()).personnel(personnel)
                .build();
    }
}