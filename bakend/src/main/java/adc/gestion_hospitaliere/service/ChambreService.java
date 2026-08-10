package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;



import adc.gestion_hospitaliere.Entity.Chambre;
import adc.gestion_hospitaliere.Entity.Specialite;
import adc.gestion_hospitaliere.Enums.StatutChambre;
import adc.gestion_hospitaliere.Enums.TypeChambre;
import adc.gestion_hospitaliere.Repository.ChambreRepository;
import adc.gestion_hospitaliere.Repository.SpecialiteRepository;
import adc.gestion_hospitaliere.dto.chambre.ChambreRequestDto;
import adc.gestion_hospitaliere.dto.chambre.ChambreResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ChambreService {

    private final ChambreRepository chambreRepository;
    private final SpecialiteRepository specialiteRepository;

    public Page<ChambreResponseDto> getAllChambres(Pageable pageable) {
        return chambreRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<ChambreResponseDto> getChambresByStatut(StatutChambre statut, Pageable pageable) {
        return chambreRepository.findByStatut(statut, pageable).map(this::toResponseDto);
    }

    public Page<ChambreResponseDto> getChambresByType(TypeChambre type, Pageable pageable) {
        return chambreRepository.findByTypeChambre(type, pageable).map(this::toResponseDto);
    }

    public Page<ChambreResponseDto> searchChambres(StatutChambre statut, TypeChambre type, Integer etage, Pageable pageable) {
        return chambreRepository.searchChambres(statut, type, etage, pageable).map(this::toResponseDto);
    }

    public ChambreResponseDto getChambreById(Integer id) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée avec l'id : " + id));
        return toResponseDto(chambre);
    }

    @Transactional
    public ChambreResponseDto createChambre(ChambreRequestDto dto) {
        if (chambreRepository.existsByNumeroChambre(dto.getNumeroChambre())) {
            throw new BusinessException("Une chambre avec ce numéro existe déjà");
        }
        Chambre chambre = toEntity(dto);
        chambre = chambreRepository.save(chambre);
        return toResponseDto(chambre);
    }

    @Transactional
    public ChambreResponseDto updateChambre(Integer id, ChambreRequestDto dto) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));
        if (chambreRepository.existsByNumeroChambreAndIdChambreNot(dto.getNumeroChambre(), id)) {
            throw new BusinessException("Une autre chambre avec ce numéro existe déjà");
        }
        updateEntity(chambre, dto);
        chambre = chambreRepository.save(chambre);
        return toResponseDto(chambre);
    }

    @Transactional
    public void deleteChambre(Integer id) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));
        // Vérifier si des hospitalisations sont liées
        if (chambre.getHospitalisations() != null && !chambre.getHospitalisations().isEmpty()) {
            throw new BusinessException("Impossible de supprimer une chambre qui a des hospitalisations");
        }
        chambreRepository.delete(chambre);
    }

    @Transactional
    public ChambreResponseDto changerStatut(Integer id, StatutChambre nouveauStatut) {
        Chambre chambre = chambreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Chambre non trouvée"));
        chambre.setStatut(nouveauStatut);
        return toResponseDto(chambreRepository.save(chambre));
    }

    // Mappers
    private ChambreResponseDto toResponseDto(Chambre chambre) {
        String nomSpecialite = null;
        if (chambre.getSpecialite() != null) {
            nomSpecialite = chambre.getSpecialite().getNomSpecialite();
        }
        return ChambreResponseDto.builder()
                .idChambre(chambre.getIdChambre())
                .numeroChambre(chambre.getNumeroChambre())
                .etage(chambre.getEtage())
                .batiment(chambre.getBatiment())
                .typeChambre(chambre.getTypeChambre())
                .statut(chambre.getStatut())
                .prixJour(chambre.getPrixJour())
                .idSpecialite(chambre.getIdSpecialite())
                .nomSpecialite(nomSpecialite)
                .equipements(chambre.getEquipements())
                .telephone(chambre.getTelephone())
                .television(chambre.getTelevision())
                .wifi(chambre.getWifi())
                .salleBainPrivee(chambre.getSalleBainPrivee())
                .accessibiliteHandicape(chambre.getAccessibiliteHandicape())
                .notes(chambre.getNotes())
                .nombreHospitalisations(chambre.getHospitalisations() != null ? chambre.getHospitalisations().size() : 0)
                .build();
    }

    private Chambre toEntity(ChambreRequestDto dto) {
        return Chambre.builder()
                .numeroChambre(dto.getNumeroChambre())
                .etage(dto.getEtage())
                .batiment(dto.getBatiment())
                .typeChambre(dto.getTypeChambre())
                .statut(dto.getStatut() != null ? dto.getStatut() : StatutChambre.Disponible)
                .prixJour(dto.getPrixJour())
                .idSpecialite(dto.getIdSpecialite())
                .equipements(dto.getEquipements())
                .telephone(dto.getTelephone() != null ? dto.getTelephone() : false)
                .television(dto.getTelevision() != null ? dto.getTelevision() : false)
                .wifi(dto.getWifi() != null ? dto.getWifi() : false)
                .salleBainPrivee(dto.getSalleBainPrivee() != null ? dto.getSalleBainPrivee() : true)
                .accessibiliteHandicape(dto.getAccessibiliteHandicape() != null ? dto.getAccessibiliteHandicape() : true)
                .notes(dto.getNotes())
                .build();
    }

    private void updateEntity(Chambre chambre, ChambreRequestDto dto) {
        chambre.setNumeroChambre(dto.getNumeroChambre());
        chambre.setEtage(dto.getEtage());
        chambre.setBatiment(dto.getBatiment());
        chambre.setTypeChambre(dto.getTypeChambre());
        if (dto.getStatut() != null) chambre.setStatut(dto.getStatut());
        chambre.setPrixJour(dto.getPrixJour());
        chambre.setIdSpecialite(dto.getIdSpecialite());
        chambre.setEquipements(dto.getEquipements());
        chambre.setTelephone(dto.getTelephone() != null ? dto.getTelephone() : chambre.getTelephone());
        chambre.setTelevision(dto.getTelevision() != null ? dto.getTelevision() : chambre.getTelevision());
        chambre.setWifi(dto.getWifi() != null ? dto.getWifi() : chambre.getWifi());
        chambre.setSalleBainPrivee(dto.getSalleBainPrivee() != null ? dto.getSalleBainPrivee() : chambre.getSalleBainPrivee());
        chambre.setAccessibiliteHandicape(dto.getAccessibiliteHandicape() != null ? dto.getAccessibiliteHandicape() : chambre.getAccessibiliteHandicape());
        chambre.setNotes(dto.getNotes());
    }
}
