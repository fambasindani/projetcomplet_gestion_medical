package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;

import adc.gestion_hospitaliere.Entity.Specialite;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Chambre;
import adc.gestion_hospitaliere.Repository.SpecialiteRepository;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.ChambreRepository;
import adc.gestion_hospitaliere.dto.Specialites.SpecialiteRequestDto;
import adc.gestion_hospitaliere.dto.Specialites.SpecialiteResponseDto;
import adc.gestion_hospitaliere.dto.medcin.MedecinResponseDto;
import adc.gestion_hospitaliere.dto.chambre.ChambreResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SpecialiteService {

    private final SpecialiteRepository specialiteRepository;
    private final MedecinRepository medecinRepository;
    private final ChambreRepository chambreRepository;

    public Page<SpecialiteResponseDto> getAllSpecialites(Pageable pageable) {
        return specialiteRepository.findAll(pageable)
                .map(this::convertToResponseDto);
    }

    public Page<SpecialiteResponseDto> getSpecialitesActives(Pageable pageable) {
        return specialiteRepository.findByActifTrue(pageable)
                .map(this::convertToResponseDto);
    }

    public SpecialiteResponseDto getSpecialiteById(Integer id) {
        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité non trouvée avec l'id : " + id));
        return convertToResponseDto(specialite);
    }

    public Page<SpecialiteResponseDto> rechercherSpecialites(String nom, Pageable pageable) {
        return specialiteRepository.findByNomSpecialiteContainingIgnoreCaseOrDescriptionContainingIgnoreCase(nom, nom, pageable)
                .map(this::convertToResponseDto);
    }

    @Transactional
    public SpecialiteResponseDto createSpecialite(SpecialiteRequestDto requestDto) {
        if (specialiteRepository.existsByNomSpecialiteIgnoreCase(requestDto.getNomSpecialite())) {
            throw new BusinessException("Une spécialité avec ce nom existe déjà");
        }
        Specialite specialite = new Specialite();
        specialite.setNomSpecialite(requestDto.getNomSpecialite());
        specialite.setDescription(requestDto.getDescription());
        specialite.setChefService(requestDto.getChefService());
        specialite.setTelephoneService(requestDto.getTelephoneService());
        specialite.setEmailService(requestDto.getEmailService());
        specialite.setDateCreation(LocalDateTime.now());
        specialite.setActif(requestDto.getActif() != null ? requestDto.getActif() : true);
        specialite = specialiteRepository.save(specialite);
        return convertToResponseDto(specialite);
    }

    @Transactional
    public SpecialiteResponseDto updateSpecialite(Integer id, SpecialiteRequestDto requestDto) {
        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité non trouvée avec l'id : " + id));

        if (specialiteRepository.existsByNomSpecialiteIgnoreCaseAndIdSpecialiteNot(requestDto.getNomSpecialite(), id)) {
            throw new BusinessException("Une autre spécialité avec ce nom existe déjà");
        }

        specialite.setNomSpecialite(requestDto.getNomSpecialite());
        specialite.setDescription(requestDto.getDescription());
        specialite.setChefService(requestDto.getChefService());
        specialite.setTelephoneService(requestDto.getTelephoneService());
        specialite.setEmailService(requestDto.getEmailService());
        specialite.setActif(requestDto.getActif() != null ? requestDto.getActif() : specialite.getActif());

        specialite = specialiteRepository.save(specialite);
        return convertToResponseDto(specialite);
    }

    @Transactional
    public void toggleActivation(Integer id, boolean activer) {
        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité non trouvée"));
        specialite.setActif(activer);
        specialiteRepository.save(specialite);
    }

    @Transactional
    public void deleteSpecialite(Integer id) {
        Specialite specialite = specialiteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Spécialité non trouvée"));
        if (specialite.getMedecins() != null && !specialite.getMedecins().isEmpty()) {
            throw new BusinessException("Impossible de supprimer une spécialité associée à des médecins");
        }
        if (specialite.getChambres() != null && !specialite.getChambres().isEmpty()) {
            throw new BusinessException("Impossible de supprimer une spécialité associée à des chambres");
        }
        specialiteRepository.delete(specialite);
    }

    public Page<SpecialiteResponseDto> getSpecialitesSansMedecins(Pageable pageable) {
        return specialiteRepository.findSpecialitesSansMedecins(pageable)
                .map(this::convertToResponseDto);
    }

    public Page<SpecialiteResponseDto> getSpecialitesAvecMedecins(Pageable pageable) {
        return specialiteRepository.findSpecialitesAvecMedecins(pageable)
                .map(this::convertToResponseDto);
    }

    public Page<MedecinResponseDto> getMedecinsBySpecialite(Integer specialiteId, Pageable pageable) {
        if (!specialiteRepository.existsById(specialiteId)) {
            throw new ResourceNotFoundException("Spécialité non trouvée avec l'id : " + specialiteId);
        }
        return medecinRepository.findByIdSpecialite(specialiteId, pageable)
                .map(this::convertMedecin);
    }

    public Page<ChambreResponseDto> getChambresBySpecialite(Integer specialiteId, Pageable pageable) {
        if (!specialiteRepository.existsById(specialiteId)) {
            throw new ResourceNotFoundException("Spécialité non trouvée avec l'id : " + specialiteId);
        }
        return chambreRepository.findByIdSpecialite(specialiteId, pageable)
                .map(this::convertChambre);
    }

    public Map<String, Object> getStatistiques() {
        long totalSpecialites = specialiteRepository.count();
        long specialitesActives = specialiteRepository.countByActifTrue();
        long specialitesInactives = totalSpecialites - specialitesActives;

        var details = specialiteRepository.findAll().stream()
                .map(s -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("specialite", s.getNomSpecialite());
                    item.put("nombreMedecins", s.getMedecins() != null ? s.getMedecins().size() : 0);
                    item.put("nombreChambres", s.getChambres() != null ? s.getChambres().size() : 0);
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalSpecialites", totalSpecialites);
        stats.put("specialitesActives", specialitesActives);
        stats.put("specialitesInactives", specialitesInactives);
        stats.put("detailsParSpecialite", details);
        return stats;
    }



    private SpecialiteResponseDto convertToResponseDto(Specialite specialite) {
        return SpecialiteResponseDto.builder()
                .idSpecialite(specialite.getIdSpecialite())
                .nomSpecialite(specialite.getNomSpecialite())
                .description(specialite.getDescription())
                .chefService(specialite.getChefService())
                .telephoneService(specialite.getTelephoneService())
                .emailService(specialite.getEmailService())
                .dateCreation(specialite.getDateCreation())
                .actif(specialite.getActif())
                .nombreMedecins(specialite.getMedecins() != null ? specialite.getMedecins().size() : 0)
                .nombreChambres(specialite.getChambres() != null ? specialite.getChambres().size() : 0)
                .build();
    }

    private MedecinResponseDto convertMedecin(Medecin m) {
        return MedecinResponseDto.builder()
                .idMedecin(m.getIdMedecin())
                .matricule(m.getMatricule())
                .nom(m.getNom())
                .prenom(m.getPrenom())
                .dateNaissance(m.getDateNaissance())
                .lieuNaissance(m.getLieuNaissance())
                .genre(m.getGenre())
                .telephone(m.getTelephone())
                .email(m.getEmail())
                .adresse(m.getAdresse())
                .idSpecialite(m.getIdSpecialite())
                .nomSpecialite(m.getSpecialite() != null ? m.getSpecialite().getNomSpecialite() : null)
                .qualification(m.getQualification())
                .diplome(m.getDiplome())
                .numeroOrdre(m.getNumeroOrdre())
                .dateEmbauche(m.getDateEmbauche())
                .salaire(m.getSalaire())
                .disponibilite(m.getDisponibilite())
                .photo(m.getPhoto())
                .notes(m.getNotes())
                .dateCreation(m.getDateCreation())
                .build();
    }

    private ChambreResponseDto convertChambre(Chambre c) {
        return ChambreResponseDto.builder()
                .idChambre(c.getIdChambre())
                .numeroChambre(c.getNumeroChambre())
                .etage(c.getEtage())
                .batiment(c.getBatiment())
                .typeChambre(c.getTypeChambre())
                .statut(c.getStatut())
                .prixJour(c.getPrixJour())
                .idSpecialite(c.getIdSpecialite())
                .nomSpecialite(c.getSpecialite() != null ? c.getSpecialite().getNomSpecialite() : null)
                .equipements(c.getEquipements())
                .telephone(c.getTelephone())
                .television(c.getTelevision())
                .wifi(c.getWifi())
                .salleBainPrivee(c.getSalleBainPrivee())
                .accessibiliteHandicape(c.getAccessibiliteHandicape())
                .notes(c.getNotes())
                .nombreHospitalisations(c.getHospitalisations() != null ? c.getHospitalisations().size() : 0)
                .build();
    }
}