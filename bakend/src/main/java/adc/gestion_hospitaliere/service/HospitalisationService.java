package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.*;
import adc.gestion_hospitaliere.Enums.StatutChambre;
import adc.gestion_hospitaliere.Enums.StatutHospitalisation;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.hospitalisation.HospitalisationRequestDto;
import adc.gestion_hospitaliere.dto.hospitalisation.HospitalisationResponseDto;
import adc.gestion_hospitaliere.exception.BusinessException;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.util.TransitionsStatut;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class HospitalisationService {

    private final HospitalisationRepository hospitalisationRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;
    private final ChambreRepository chambreRepository;

    private String generateNumeroAdmission() {
        String prefix = "HOSP-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd")) + "-";
        String numero;
        do {
            numero = prefix + String.format("%04d", ThreadLocalRandom.current().nextInt(10000));
        } while (hospitalisationRepository.existsByNumeroAdmission(numero));
        return numero;
    }

    public Page<adc.gestion_hospitaliere.dto.hospitalisation.HospitalisationResponseDto> getAll(Pageable pageable) {
        return hospitalisationRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<adc.gestion_hospitaliere.dto.hospitalisation.HospitalisationResponseDto> getAllForMedecin(Integer medecinId, Pageable pageable) {
        return hospitalisationRepository.findByIdMedecinResponsable(medecinId, pageable).map(this::toResponseDto);
    }

    public Page<HospitalisationResponseDto> search(StatutHospitalisation statut, Integer idPatient,
                                                   LocalDateTime dateStart, LocalDateTime dateEnd,
                                                   Pageable pageable) {
        return hospitalisationRepository.search(statut, idPatient, dateStart, dateEnd, pageable)
                .map(this::toResponseDto);
    }

    public HospitalisationResponseDto getById(Integer id) {
        Hospitalisation h = hospitalisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalisation non trouvée"));
        return toResponseDto(h);
    }


    @Transactional
    public HospitalisationResponseDto create(HospitalisationRequestDto dto) {
        Hospitalisation h = new Hospitalisation();

        // Génération du numéro d'admission si non fourni ou vide
        String numero = dto.getNumeroAdmission();
        if (numero == null || numero.isBlank()) {
            numero = generateNumeroAdmission(); // méthode à implémenter
        }
        h.setNumeroAdmission(numero);

        updateEntity(h, dto);
        h = hospitalisationRepository.save(h);
        occuperChambre(h);
        return toResponseDto(h);
    }

    @Transactional
    public HospitalisationResponseDto changerStatut(Integer id, StatutHospitalisation nouveauStatut) {
        Hospitalisation h = hospitalisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalisation non trouvée"));

        TransitionsStatut.verifierHospitalisation(h.getStatut(), nouveauStatut);
        StatutHospitalisation ancien = h.getStatut();
        h.setStatut(nouveauStatut);

        boolean sortieEngagee = nouveauStatut != null && nouveauStatut != StatutHospitalisation.En_cours;
        if (sortieEngagee) {
            if (h.getDateSortie() == null) {
                h.setDateSortie(LocalDateTime.now());
            }
            if (ancien == StatutHospitalisation.En_cours) {
                libererChambre(h);
            }
        }

        h = hospitalisationRepository.save(h);
        return toResponseDto(h);
    }

    @Transactional
    public HospitalisationResponseDto update(Integer id, HospitalisationRequestDto dto) {
        Hospitalisation h = hospitalisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalisation non trouvée"));
        Integer ancienneChambre = h.getIdChambre();
        updateEntity(h, dto);
        h = hospitalisationRepository.save(h);
        if (dto.getIdChambre() != null && !dto.getIdChambre().equals(ancienneChambre)
                && h.getStatut() == StatutHospitalisation.En_cours) {
            occuperChambre(h);
        }
        return toResponseDto(h);
    }

    @Transactional
    public void delete(Integer id) {
        Hospitalisation h = hospitalisationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalisation non trouvée"));
        libererChambre(h);
        hospitalisationRepository.delete(h);
    }

    private void occuperChambre(Hospitalisation h) {
        if (h.getIdChambre() == null || h.getStatut() != StatutHospitalisation.En_cours) return;
        Chambre chambre = chambreRepository.findById(h.getIdChambre()).orElse(null);
        if (chambre == null) return;
        if (chambre.getStatut() == StatutChambre.Hors_service) {
            throw new BusinessException("La chambre " + chambre.getNumeroChambre() + " est hors service");
        }
        if (chambre.getStatut() != StatutChambre.Occupee) {
            chambre.setStatut(StatutChambre.Occupee);
            chambreRepository.save(chambre);
        }
    }

    private void libererChambre(Hospitalisation h) {
        if (h.getIdChambre() == null) return;
        Chambre chambre = chambreRepository.findById(h.getIdChambre()).orElse(null);
        if (chambre == null || chambre.getStatut() != StatutChambre.Occupee) return;
        boolean encoreOccupee = hospitalisationRepository
                .existsByIdChambreAndStatut(h.getIdChambre(), StatutHospitalisation.En_cours);
        if (!encoreOccupee) {
            chambre.setStatut(StatutChambre.En_nettoyage);
            chambreRepository.save(chambre);
        }
    }

    private void updateEntity(Hospitalisation h, HospitalisationRequestDto dto) {
        h.setIdPatient(dto.getIdPatient());
        h.setIdChambre(dto.getIdChambre());
        h.setIdMedecinResponsable(dto.getIdMedecinResponsable());
        h.setDateAdmission(dto.getDateAdmission());
        h.setDateSortie(dto.getDateSortie());
        h.setMotifAdmission(dto.getMotifAdmission());
        h.setModeEntree(dto.getModeEntree());
        h.setProvenance(dto.getProvenance());
        h.setDiagnosticPrincipal(dto.getDiagnosticPrincipal());
        h.setTraitementsEnCours(dto.getTraitementsEnCours());
        h.setExamensRealises(dto.getExamensRealises());
        h.setRegimeAlimentaire(dto.getRegimeAlimentaire());
        h.setConsignesParticulieres(dto.getConsignesParticulieres());
        h.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutHospitalisation.En_cours);
        h.setNotesSortie(dto.getNotesSortie());
        h.setModeSortie(dto.getModeSortie());
        h.setDestinationSortie(dto.getDestinationSortie());
    }

    private HospitalisationResponseDto toResponseDto(Hospitalisation h) {
        String patientNom = null, patientPrenom = null;
        if (h.getPatient() != null) {
            patientNom = h.getPatient().getNom();
            patientPrenom = h.getPatient().getPrenom();
        }
        String chambreNumero = null;
        if (h.getChambre() != null) {
            chambreNumero = h.getChambre().getNumeroChambre();
        }
        String medecinNom = null, medecinPrenom = null;
        if (h.getMedecinResponsable() != null) {
            medecinNom = h.getMedecinResponsable().getNom();
            medecinPrenom = h.getMedecinResponsable().getPrenom();
        }
        return HospitalisationResponseDto.builder()
                .idHospitalisation(h.getIdHospitalisation())
                .numeroAdmission(h.getNumeroAdmission())
                .idPatient(h.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .idChambre(h.getIdChambre())
                .chambreNumero(chambreNumero)
                .idMedecinResponsable(h.getIdMedecinResponsable())
                .medecinNom(medecinNom)
                .medecinPrenom(medecinPrenom)
                .dateAdmission(h.getDateAdmission())
                .dateSortie(h.getDateSortie())
                .motifAdmission(h.getMotifAdmission())
                .modeEntree(h.getModeEntree())
                .provenance(h.getProvenance())
                .diagnosticPrincipal(h.getDiagnosticPrincipal())
                .traitementsEnCours(h.getTraitementsEnCours())
                .examensRealises(h.getExamensRealises())
                .regimeAlimentaire(h.getRegimeAlimentaire())
                .consignesParticulieres(h.getConsignesParticulieres())
                .statut(h.getStatut())
                .notesSortie(h.getNotesSortie())
                .modeSortie(h.getModeSortie())
                .destinationSortie(h.getDestinationSortie())
                .dateCreation(h.getDateCreation())
                .build();
    }
}
