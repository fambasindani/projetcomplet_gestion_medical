package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.personnel.PersonnelRequestDto;
import adc.gestion_hospitaliere.dto.personnel.PersonnelResponseDto;
import adc.gestion_hospitaliere.dto.personnel.PersonnelUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PersonnelService {

    private final PersonnelRepository personnelRepository;

    @Transactional
    public PersonnelResponseDto createPersonnel(PersonnelRequestDto dto) {
        // Vérifications d'unicité
        if (personnelRepository.existsByMatricule(dto.getMatricule())) {
            throw new BusinessException("Un personnel avec le matricule '" + dto.getMatricule() + "' existe déjà");
        }
        if (dto.getEmail() != null && personnelRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Un personnel avec l'email '" + dto.getEmail() + "' existe déjà");
        }

        // Dans createPersonnel et updatePersonnel
        Personnel personnel = Personnel.builder()
                .matricule(dto.getMatricule())
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .dateNaissance(dto.getDateNaissance() != null ? dto.getDateNaissance().atStartOfDay() : null)
                .genre(dto.getGenre())
                .fonction(dto.getFonction())
                .service(dto.getService())
                .telephone(dto.getTelephone())
                .email(dto.getEmail())
                .adresse(dto.getAdresse())
                .dateEmbauche(dto.getDateEmbauche() != null ? dto.getDateEmbauche().atStartOfDay() : null)
                .salaire(dto.getSalaire())
                .typeContrat(dto.getTypeContrat())
                .photo(dto.getPhoto())
                .build();

        Personnel saved = personnelRepository.save(personnel);
        return convertToResponseDto(saved);
    }

    public PagedResponse<PersonnelResponseDto> getAllPersonnels(Pageable pageable) {
        Page<PersonnelResponseDto> page = personnelRepository.findAll(pageable)
                .map(this::convertToResponseDto);
        return PagedResponse.of(page);
    }

    public PagedResponse<PersonnelResponseDto> searchPersonnels(String keyword, Pageable pageable) {
        if (keyword == null || keyword.isBlank()) {
            return getAllPersonnels(pageable);
        }
        Page<PersonnelResponseDto> page = personnelRepository.searchByKeyword(keyword, pageable)
                .map(this::convertToResponseDto);
        return PagedResponse.of(page);
    }

    public PersonnelResponseDto getPersonnelById(Integer id) {
        Personnel personnel = personnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel non trouvé avec l'id : " + id));
        return convertToResponseDto(personnel);
    }

    @Transactional
    public PersonnelResponseDto updatePersonnel(Integer id, PersonnelUpdateDto dto) {
        if (!id.equals(dto.getIdPersonnel())) {
            throw new BusinessException("L'ID du path ne correspond pas à l'ID du body");
        }

        Personnel personnel = personnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel non trouvé"));

        // Vérifications unicité (sauf pour l'élément lui-même)
        if (!personnel.getMatricule().equals(dto.getMatricule()) &&
                personnelRepository.existsByMatriculeAndIdPersonnelNot(dto.getMatricule(), id)) {
            throw new BusinessException("Matricule déjà utilisé");
        }
        if (dto.getEmail() != null && !dto.getEmail().equals(personnel.getEmail()) &&
                personnelRepository.existsByEmailAndIdPersonnelNot(dto.getEmail(), id)) {
            throw new BusinessException("Email déjà utilisé");
        }

        personnel.setMatricule(dto.getMatricule());
        personnel.setNom(dto.getNom());
        personnel.setPrenom(dto.getPrenom());
        personnel.setDateNaissance(dto.getDateNaissance() != null ? dto.getDateNaissance().atStartOfDay() : null);
        personnel.setGenre(dto.getGenre());
        personnel.setFonction(dto.getFonction());
        personnel.setService(dto.getService());
        personnel.setTelephone(dto.getTelephone());
        personnel.setEmail(dto.getEmail());
        personnel.setAdresse(dto.getAdresse());
        personnel.setDateEmbauche(dto.getDateEmbauche() != null ? dto.getDateEmbauche().atStartOfDay() : null);
        personnel.setSalaire(dto.getSalaire());
        personnel.setTypeContrat(dto.getTypeContrat());
        personnel.setPhoto(dto.getPhoto());

        Personnel updated = personnelRepository.save(personnel);
        return convertToResponseDto(updated);
    }

    @Transactional
    public void deletePersonnel(Integer id) {
        if (!personnelRepository.existsById(id)) {
            throw new ResourceNotFoundException("Personnel non trouvé");
        }
        personnelRepository.deleteById(id);
    }

    // Statistiques
    public Map<String, Object> getStatistiques() {
        long total = personnelRepository.count();

        // Regroupement par fonction (top 5)
        List<Personnel> all = personnelRepository.findAll();
        Map<String, Long> statsParFonction = all.stream()
                .collect(Collectors.groupingBy(Personnel::getFonction, Collectors.counting()));
        List<Map<String, Object>> topFonctions = statsParFonction.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("fonction", e.getKey());
                    m.put("effectif", e.getValue());
                    return m;
                })
                .collect(Collectors.toList());

        // Répartition par service
        Map<String, Long> statsParService = all.stream()
                .filter(p -> p.getService() != null && !p.getService().isBlank())
                .collect(Collectors.groupingBy(Personnel::getService, Collectors.counting()));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalPersonnels", total);
        result.put("topFonctions", topFonctions);
        result.put("repartitionParService", statsParService);
        return result;
    }

    private PersonnelResponseDto convertToResponseDto(Personnel p) {
        return PersonnelResponseDto.builder()
                .idPersonnel(p.getIdPersonnel())
                .matricule(p.getMatricule())
                .nom(p.getNom())
                .prenom(p.getPrenom())
                .dateNaissance(p.getDateNaissance())
                .genre(p.getGenre())
                .fonction(p.getFonction())
                .service(p.getService())
                .telephone(p.getTelephone())
                .email(p.getEmail())
                .adresse(p.getAdresse())
                .dateEmbauche(p.getDateEmbauche())
                .salaire(p.getSalaire())
                .typeContrat(p.getTypeContrat())
                .photo(p.getPhoto())
                .build();
    }
}