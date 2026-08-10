package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.Consultation;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Entity.RendezVous;
import adc.gestion_hospitaliere.Enums.Disponibilite;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import adc.gestion_hospitaliere.Repository.ConsultationRepository;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.RendezVousRepository;
import adc.gestion_hospitaliere.Repository.SpecialiteRepository;
import adc.gestion_hospitaliere.dto.medcin.MedecinRequestDto;
import adc.gestion_hospitaliere.dto.medcin.MedecinResponseDto;
import adc.gestion_hospitaliere.dto.medcin.MedecinUpdateDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedecinService {

    private final MedecinRepository medecinRepository;
    private final SpecialiteRepository specialiteRepository;
    private final RendezVousRepository rendezVousRepository;
    private final ConsultationRepository consultationRepository;

    // ---------- GET all ----------
    public Page<MedecinResponseDto> getAllMedecins(Pageable pageable) {
        return medecinRepository.findAll(pageable)
                .map(this::convertToResponseDto);
    }

    // ---------- GET by id ----------
    public MedecinResponseDto getMedecinById(Integer id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'id : " + id));
        return convertToResponseDto(medecin);
    }

    // ---------- CREATE ----------
    @Transactional
    public MedecinResponseDto createMedecin(MedecinRequestDto dto) {
        if (medecinRepository.existsByMatricule(dto.getMatricule())) {
            throw new BusinessException("Un médecin avec le matricule '" + dto.getMatricule() + "' existe déjà");
        }
        if (dto.getEmail() != null && medecinRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Un médecin avec l'email '" + dto.getEmail() + "' existe déjà");
        }
        if (dto.getNumeroOrdre() != null && medecinRepository.existsByNumeroOrdre(dto.getNumeroOrdre())) {
            throw new BusinessException("Un médecin avec le numéro d'ordre '" + dto.getNumeroOrdre() + "' existe déjà");
        }

        Medecin medecin = Medecin.builder()
                .matricule(dto.getMatricule())
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .dateNaissance(dto.getDateNaissance())
                .lieuNaissance(dto.getLieuNaissance())
                .genre(dto.getGenre())
                .telephone(dto.getTelephone())
                .email(dto.getEmail())
                .adresse(dto.getAdresse())
                .idSpecialite(dto.getIdSpecialite())
                .qualification(dto.getQualification())
                .diplome(dto.getDiplome())
                .numeroOrdre(dto.getNumeroOrdre())
                .dateEmbauche(dto.getDateEmbauche())
                .salaire(dto.getSalaire())
                .disponibilite(dto.getDisponibilite() != null ? dto.getDisponibilite() : Disponibilite.Disponible)
                .photo(dto.getPhoto())
                .notes(dto.getNotes())
                .dateCreation(LocalDateTime.now())
                .build();

        Medecin saved = medecinRepository.save(medecin);
        if (saved.getIdSpecialite() != null) {
            saved.setSpecialite(specialiteRepository.findById(saved.getIdSpecialite()).orElse(null));
        }
        return convertToResponseDto(saved);
    }

    // ---------- UPDATE ----------
    @Transactional
    public MedecinResponseDto updateMedecin(Integer id, MedecinUpdateDto dto) {
        if (!id.equals(dto.getIdMedecin())) {
            throw new BusinessException("L'ID du path ne correspond pas à l'ID du body");
        }

        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé avec l'id : " + id));

        if (medecinRepository.existsByMatriculeAndIdMedecinNot(dto.getMatricule(), id)) {
            throw new BusinessException("Matricule déjà utilisé");
        }
        if (dto.getEmail() != null && medecinRepository.existsByEmailAndIdMedecinNot(dto.getEmail(), id)) {
            throw new BusinessException("Email déjà utilisé");
        }
        if (dto.getNumeroOrdre() != null && medecinRepository.existsByNumeroOrdreAndIdMedecinNot(dto.getNumeroOrdre(), id)) {
            throw new BusinessException("Numéro d'ordre déjà utilisé");
        }

        medecin.setMatricule(dto.getMatricule());
        medecin.setNom(dto.getNom());
        medecin.setPrenom(dto.getPrenom());
        medecin.setDateNaissance(dto.getDateNaissance());
        medecin.setLieuNaissance(dto.getLieuNaissance());
        medecin.setGenre(dto.getGenre());
        medecin.setTelephone(dto.getTelephone());
        medecin.setEmail(dto.getEmail());
        medecin.setAdresse(dto.getAdresse());
        medecin.setIdSpecialite(dto.getIdSpecialite());
        medecin.setQualification(dto.getQualification());
        medecin.setDiplome(dto.getDiplome());
        medecin.setNumeroOrdre(dto.getNumeroOrdre());
        medecin.setDateEmbauche(dto.getDateEmbauche());
        medecin.setSalaire(dto.getSalaire());
        medecin.setDisponibilite(dto.getDisponibilite());
        medecin.setPhoto(dto.getPhoto());
        medecin.setNotes(dto.getNotes());

        Medecin updated = medecinRepository.save(medecin);
        if (updated.getIdSpecialite() != null) {
            updated.setSpecialite(specialiteRepository.findById(updated.getIdSpecialite()).orElse(null));
        }
        return convertToResponseDto(updated);
    }

    // ---------- DELETE ----------
    @Transactional
    public void deleteMedecin(Integer id) {
        if (!medecinRepository.existsById(id)) {
            throw new ResourceNotFoundException("Médecin non trouvé avec l'id : " + id);
        }
        medecinRepository.deleteById(id);
    }

    // ---------- PATCH photo ----------
    @Transactional
    public void updatePhoto(Integer id, String photoUrl) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
        medecin.setPhoto(photoUrl);
        medecinRepository.save(medecin);
    }

    // ---------- PATCH disponibilité ----------
    @Transactional
    public void updateDisponibilite(Integer id, Disponibilite disponibilite) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));
        medecin.setDisponibilite(disponibilite);
        medecinRepository.save(medecin);
    }

    // ---------- RECHERCHE ----------
    public Page<MedecinResponseDto> searchMedecins(String term, Pageable pageable) {
        return medecinRepository.searchByTerm(term, pageable)
                .map(this::convertToResponseDto);
    }

    // ---------- PAR SPECIALITE ----------
    public Page<MedecinResponseDto> getMedecinsBySpecialite(Integer specialiteId, Pageable pageable) {
        if (!specialiteRepository.existsById(specialiteId)) {
            throw new ResourceNotFoundException("Spécialité non trouvée");
        }
        return medecinRepository.findByIdSpecialite(specialiteId, pageable)
                .map(this::convertToResponseDto);
    }

    // ---------- MÉDECINS DISPONIBLES ----------
    public Page<MedecinResponseDto> getMedecinsDisponibles(Pageable pageable) {
        return medecinRepository.findByDisponibilite(Disponibilite.Disponible, pageable)
                .map(this::convertToResponseDto);
    }

    // ---------- STATISTIQUES ----------
    public Map<String, Object> getStatistiques() {
        long totalMedecins = medecinRepository.count();
        long medecinsActifs = medecinRepository.countByDisponibilite(Disponibilite.Disponible);
        long medecinsRecents = medecinRepository.countByDateCreationAfter(LocalDateTime.now().minusDays(30));

        // Âge moyen (si dateNaissance renseignée)
        List<Medecin> allMedecins = medecinRepository.findAll();
        double ageMoyen = allMedecins.stream()
                .filter(m -> m.getDateNaissance() != null)
                .mapToInt(m -> {
                    LocalDate birth = m.getDateNaissance().toLocalDate();
                    return Period.between(birth, LocalDate.now()).getYears();
                })
                .average()
                .orElse(0.0);
        ageMoyen = Math.round(ageMoyen * 10.0) / 10.0; // une décimale

        // Statistiques par spécialité (objet intermédiaire)
        Map<String, Map<String, Long>> statsParSpecialiteMap = allMedecins.stream()
                .filter(m -> m.getSpecialite() != null)
                .collect(Collectors.groupingBy(
                        m -> m.getSpecialite().getNomSpecialite(),
                        Collectors.collectingAndThen(
                                Collectors.toList(),
                                list -> {
                                    long total = list.size();
                                    long dispo = list.stream().filter(m -> m.getDisponibilite() == Disponibilite.Disponible).count();
                                    long conge = list.stream().filter(m -> m.getDisponibilite() == Disponibilite.EnConge).count();
                                    long absent = list.stream().filter(m -> m.getDisponibilite() == Disponibilite.Absent).count();
                                    long formation = list.stream().filter(m -> m.getDisponibilite() == Disponibilite.EnFormation).count();
                                    Map<String, Long> map = new LinkedHashMap<>();
                                    map.put("nombreMedecins", total);
                                    map.put("disponibles", dispo);
                                    map.put("enConge", conge);
                                    map.put("absents", absent);
                                    map.put("enFormation", formation);
                                    return map;
                                }
                        )
                ));

        // Conversion en liste pour parSpecialite
        List<Map<String, Object>> parSpecialiteList = statsParSpecialiteMap.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("specialite", entry.getKey());
                    item.putAll(entry.getValue());
                    return item;
                })
                .collect(Collectors.toList());

        // Statistiques par disponibilité (objet intermédiaire)
        Map<String, Long> statsParDisponibiliteMap = Arrays.stream(Disponibilite.values())
                .collect(Collectors.toMap(
                        Disponibilite::name,
                        d -> medecinRepository.countByDisponibilite(d),
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));

        // Conversion en liste avec pourcentage et id
        List<Map<String, Object>> parDisponibiliteList = statsParDisponibiliteMap.entrySet().stream()
                .map(entry -> {
                    String disponibilite = entry.getKey();
                    long nombre = entry.getValue();
                    double pourcentage = totalMedecins > 0 ? (nombre * 100.0) / totalMedecins : 0;
                    pourcentage = Math.round(pourcentage * 100.0) / 100.0;
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("disponibilite", disponibilite);
                    item.put("nombre", nombre);
                    item.put("pourcentage", pourcentage);
                    int id = switch (disponibilite) {
                        case "Disponible" -> 0;
                        case "EnConge" -> 1;
                        case "Absent" -> 2;
                        case "EnFormation" -> 3;
                        default -> -1;
                    };
                    item.put("disponibiliteId", id);
                    return item;
                })
                .collect(Collectors.toList());

        // Top 5 médecins (exemple : par date d'embauche la plus récente, ou par nombre de consultations)
        List<Map<String, Object>> topMedecins = allMedecins.stream()
                .sorted(Comparator.comparing(Medecin::getDateCreation, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(m -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("id", m.getIdMedecin());
                    map.put("nom", m.getNom());
                    map.put("prenom", m.getPrenom());
                    map.put("matricule", m.getMatricule());
                    map.put("specialite", m.getSpecialite() != null ? m.getSpecialite().getNomSpecialite() : "Non spécifiée");
                    map.put("photo", m.getPhoto());
                    // Remplacer par m.getConsultations().size() si la relation existe
                    long nbConsult = 0; // à implémenter
                    map.put("nombreConsultations", nbConsult);
                    map.put("disponibilite", m.getDisponibilite().name());
                    return map;
                })
                .collect(Collectors.toList());

        // Résumé
        Map<String, Object> resume = new LinkedHashMap<>();
        resume.put("totalMedecins", totalMedecins);
        resume.put("medecinsActifs", medecinsActifs);
        resume.put("tauxActivite", totalMedecins > 0 ? Math.round((medecinsActifs * 10000.0 / totalMedecins)) / 100.0 : 0);
        resume.put("medecinsRecents", medecinsRecents);
        resume.put("ageMoyen", ageMoyen);
        resume.put("nombreSpecialites", statsParSpecialiteMap.size());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("resume", resume);
        result.put("parSpecialite", parSpecialiteList);
        result.put("parDisponibilite", parDisponibiliteList);
        result.put("topMedecins", topMedecins);

        return result;
    }

    // ---------- DÉTAILS COMPLETS D'UN MÉDECIN ----------
    public Map<String, Object> getMedecinDetails(Integer id) {
        Medecin medecin = medecinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));

        Map<String, Object> infosPerso = new LinkedHashMap<>();
        infosPerso.put("idMedecin", medecin.getIdMedecin());
        infosPerso.put("matricule", medecin.getMatricule());
        infosPerso.put("nom", medecin.getNom());
        infosPerso.put("prenom", medecin.getPrenom());
        infosPerso.put("dateNaissance", medecin.getDateNaissance());
        infosPerso.put("lieuNaissance", medecin.getLieuNaissance());
        infosPerso.put("genre", medecin.getGenre() == Genre.M ? "Masculin" : "Féminin");
        infosPerso.put("telephone", medecin.getTelephone());
        infosPerso.put("email", medecin.getEmail());
        infosPerso.put("adresse", medecin.getAdresse());
        infosPerso.put("photo", medecin.getPhoto());

        Map<String, Object> infosPro = new LinkedHashMap<>();
        infosPro.put("specialite", medecin.getSpecialite() != null ? medecin.getSpecialite().getNomSpecialite() : "Non spécifiée");
        infosPro.put("qualification", medecin.getQualification());
        infosPro.put("diplome", medecin.getDiplome());
        infosPro.put("numeroOrdre", medecin.getNumeroOrdre());
        infosPro.put("dateEmbauche", medecin.getDateEmbauche());
        infosPro.put("salaire", medecin.getSalaire());
        infosPro.put("disponibilite", medecin.getDisponibilite());
        infosPro.put("notes", medecin.getNotes());

        // Statistiques réelles
        long totalRendezVous = rendezVousRepository.countByIdMedecin(id);
        long totalConsultations = consultationRepository.countByIdMedecin(id);

        // Rendez-vous à venir (non annulés, date future)
        List<RendezVous> rendezVousAVenirList = rendezVousRepository.findUpcomingByMedecin(
                id, LocalDateTime.now(), StatutRendezVous.Annulé);

        List<Map<String, Object>> rendezVousAVenir = rendezVousAVenirList.stream()
                .map(rdv -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("idRdv", rdv.getIdRdv());
                    item.put("dateRdv", rdv.getDateRdv());
                    item.put("statut", rdv.getStatut() != null ? rdv.getStatut().name() : null);
                    Patient patient = rdv.getPatient();
                    item.put("patient", patient != null
                            ? patient.getNom() + " " + patient.getPrenom()
                            : "Inconnu");
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalRendezVous", totalRendezVous);
        stats.put("rendezVousAVenir", (long) rendezVousAVenir.size());
        stats.put("totalConsultations", totalConsultations);

        // Dernières consultations du médecin
        List<Map<String, Object>> dernieresConsultations = consultationRepository.findByIdMedecin(
                        id, PageRequest.of(0, 5))
                .stream()
                .map(c -> {
                    Map<String, Object> item = new LinkedHashMap<>();
                    item.put("idConsultation", c.getIdConsultation());
                    item.put("dateConsultation", c.getDateConsultation());
                    item.put("motif", c.getMotifConsultation());
                    Patient patient = c.getPatient();
                    item.put("patient", patient != null
                            ? patient.getNom() + " " + patient.getPrenom()
                            : "Inconnu");
                    return item;
                })
                .collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("informationsPersonnelles", infosPerso);
        result.put("informationsProfessionnelles", infosPro);
        result.put("statistiques", stats);
        result.put("rendezVousAVenir", rendezVousAVenir);
        result.put("dernieresConsultations", dernieresConsultations);
        result.put("activiteParMois", List.of());

        return result;
    }

    // ---------- MAPPING ----------
    private MedecinResponseDto convertToResponseDto(Medecin medecin) {
        return MedecinResponseDto.builder()
                .idMedecin(medecin.getIdMedecin())
                .matricule(medecin.getMatricule())
                .nom(medecin.getNom())
                .prenom(medecin.getPrenom())
                .dateNaissance(medecin.getDateNaissance())
                .lieuNaissance(medecin.getLieuNaissance())
                .genre(medecin.getGenre())
                .telephone(medecin.getTelephone())
                .email(medecin.getEmail())
                .adresse(medecin.getAdresse())
                .idSpecialite(medecin.getIdSpecialite())
                .nomSpecialite(medecin.getSpecialite() != null ? medecin.getSpecialite().getNomSpecialite() : null)
                .qualification(medecin.getQualification())
                .diplome(medecin.getDiplome())
                .numeroOrdre(medecin.getNumeroOrdre())
                .dateEmbauche(medecin.getDateEmbauche())
                .salaire(medecin.getSalaire())
                .disponibilite(medecin.getDisponibilite())
                .photo(medecin.getPhoto())
                .notes(medecin.getNotes())
                .dateCreation(medecin.getDateCreation())
                .build();
    }
}