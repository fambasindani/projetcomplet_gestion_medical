package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;

import adc.gestion_hospitaliere.Entity.Consultation;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Patient;
import adc.gestion_hospitaliere.Enums.EvolutionConsultation;
import adc.gestion_hospitaliere.Repository.ConsultationRepository;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.dto.consultation.ConsultationRequestDto;
import adc.gestion_hospitaliere.dto.consultation.ConsultationResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ConsultationService {

    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final MedecinRepository medecinRepository;

    public Page<ConsultationResponseDto> getConsultationsByPatient(Integer patientId, Pageable pageable) {
        Page<Consultation> page = consultationRepository.findByIdPatient(patientId, pageable);
        return page.map(this::convertToDto);
    }

    public Page<ConsultationResponseDto> getConsultationsByMedecin(Integer medecinId, Pageable pageable) {
        Page<Consultation> page = consultationRepository.findByIdMedecin(medecinId, pageable);
        return page.map(this::convertToDto);
    }

    public Page<ConsultationResponseDto> getAllConsultations(Pageable pageable) {
        Page<Consultation> page = consultationRepository.findAll(pageable);
        return page.map(this::convertToDto);
    }

    public ConsultationResponseDto getConsultation(Integer id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée"));
        return convertToDto(consultation);
    }

    @Transactional
    public ConsultationResponseDto createConsultation(ConsultationRequestDto dto) {
        Patient patient = patientRepository.findById(dto.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé"));
        Medecin medecin = medecinRepository.findById(dto.getIdMedecin())
                .orElseThrow(() -> new ResourceNotFoundException("Médecin non trouvé"));

        Consultation consultation = Consultation.builder()
                .idRdv(dto.getIdRdv())
                .idPatient(dto.getIdPatient())
                .idMedecin(dto.getIdMedecin())
                .dateConsultation(dto.getDateConsultation())
                .motifConsultation(dto.getMotifConsultation())
                .histoireMaladie(dto.getHistoireMaladie())
                .diagnostic(dto.getDiagnostic())
                .traitementPrescris(dto.getTraitementPrescris())
                .observations(dto.getObservations())
                .temperature(dto.getTemperature())
                .pouls(dto.getPouls())
                .pressionSystolique(dto.getPressionSystolique())
                .pressionDiastolique(dto.getPressionDiastolique())
                .saturation(dto.getSaturation())
                .glycemie(dto.getGlycemie())
                .poids(dto.getPoids())
                .taille(dto.getTaille())
                .certificatMedical(dto.getCertificatMedical())
                .arretTravailDebut(dto.getArretTravailDebut())
                .arretTravailFin(dto.getArretTravailFin())
                .evolution(dto.getEvolution() != null ? EvolutionConsultation.valueOf(dto.getEvolution()) : null)
                .prochainRdv(dto.getProchainRdv())
                .notesConfidentielles(dto.getNotesConfidentielles())
                .build();

        // Calculer IMC si poids et taille présents
        if (consultation.getPoids() != null && consultation.getTaille() != null
                && consultation.getTaille().compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal imc = consultation.getPoids()
                    .divide(consultation.getTaille().multiply(consultation.getTaille()), 2, BigDecimal.ROUND_HALF_UP);
            consultation.setImc(imc);
        }

        Consultation saved = consultationRepository.save(consultation);
        // Mettre à jour le statut du rendez-vous si idRdv existe (optionnel)
        return convertToDto(saved);
    }

    @Transactional
    public ConsultationResponseDto updateConsultation(Integer id, ConsultationRequestDto dto) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Consultation non trouvée"));

        consultation.setDateConsultation(dto.getDateConsultation());
        consultation.setMotifConsultation(dto.getMotifConsultation());
        consultation.setHistoireMaladie(dto.getHistoireMaladie());
        consultation.setDiagnostic(dto.getDiagnostic());
        consultation.setTraitementPrescris(dto.getTraitementPrescris());
        consultation.setObservations(dto.getObservations());
        consultation.setTemperature(dto.getTemperature());
        consultation.setPouls(dto.getPouls());
        consultation.setPressionSystolique(dto.getPressionSystolique());
        consultation.setPressionDiastolique(dto.getPressionDiastolique());
        consultation.setSaturation(dto.getSaturation());
        consultation.setGlycemie(dto.getGlycemie());
        consultation.setPoids(dto.getPoids());
        consultation.setTaille(dto.getTaille());
        consultation.setCertificatMedical(dto.getCertificatMedical());
        consultation.setArretTravailDebut(dto.getArretTravailDebut());
        consultation.setArretTravailFin(dto.getArretTravailFin());
        if (dto.getEvolution() != null) {
            consultation.setEvolution(EvolutionConsultation.valueOf(dto.getEvolution()));
        }
        consultation.setProchainRdv(dto.getProchainRdv());
        consultation.setNotesConfidentielles(dto.getNotesConfidentielles());

        // Recalcul IMC
        if (consultation.getPoids() != null && consultation.getTaille() != null
                && consultation.getTaille().compareTo(BigDecimal.ZERO) != 0) {
            BigDecimal imc = consultation.getPoids()
                    .divide(consultation.getTaille().multiply(consultation.getTaille()), 2, BigDecimal.ROUND_HALF_UP);
            consultation.setImc(imc);
        } else {
            consultation.setImc(null);
        }

        Consultation updated = consultationRepository.save(consultation);
        return convertToDto(updated);
    }

    @Transactional
    public void deleteConsultation(Integer id) {
        if (!consultationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Consultation non trouvée");
        }
        consultationRepository.deleteById(id);
    }

    // ---------- STATISTIQUES ----------
    public Map<String, Object> getStatistiques() {
        Map<String, Object> result = new LinkedHashMap<>();

        long total = consultationRepository.count();
        long consultationsMois = consultationRepository.countByDateConsultationBetween(
                LocalDate.now().withDayOfMonth(1).atStartOfDay(), LocalDate.now().plusMonths(1).withDayOfMonth(1).atStartOfDay().minusNanos(1));
        long medecinsActifs = consultationRepository.countDistinctMedecins();

        // Consultations par mois (12 derniers mois)
        LocalDateTime start = LocalDate.now().minusMonths(11).withDayOfMonth(1).atStartOfDay();
        List<Object[]> parMoisRaw = consultationRepository.countByMonthSince(start);
        Map<String, Long> parMoisMap = parMoisRaw.stream()
                .collect(Collectors.toMap(
                        row -> String.valueOf(row[0]),
                        row -> ((Number) row[1]).longValue()
                ));
        List<Map<String, Object>> parMois = new ArrayList<>();
        DateTimeFormatter labelFormatter = DateTimeFormatter.ofPattern("MMM yy", Locale.FRENCH);
        for (int i = 11; i >= 0; i--) {
            LocalDate d = LocalDate.now().minusMonths(i);
            String key = d.format(DateTimeFormatter.ofPattern("yyyy-MM"));
            String mois = d.format(labelFormatter);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("mois", mois);
            item.put("nombre", parMoisMap.getOrDefault(key, 0L));
            parMois.add(item);
        }
        result.put("parMois", parMois);

        // Top médecins par nombre de consultations
        List<Object[]> topRaw = consultationRepository.findTopMedecins(PageRequest.of(0, 5));
        List<Map<String, Object>> topMedecins = new ArrayList<>();
        for (Object[] row : topRaw) {
            Medecin m = (Medecin) row[0];
            long nombre = ((Number) row[1]).longValue();
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", m.getIdMedecin());
            item.put("nom", m.getNom());
            item.put("prenom", m.getPrenom());
            item.put("nombreConsultations", nombre);
            topMedecins.add(item);
        }
        result.put("topMedecins", topMedecins);

        result.put("total", total);
        result.put("totalConsultations", total);
        result.put("consultationsMois", consultationsMois);
        result.put("medecinsActifs", medecinsActifs);
        return result;
    }




    private ConsultationResponseDto convertToDto(Consultation c) {
        return ConsultationResponseDto.builder()
                .idConsultation(c.getIdConsultation())
                .idRdv(c.getIdRdv())
                .idPatient(c.getIdPatient())
                .patientNom(c.getPatient() != null ? c.getPatient().getNom() : null)
                .patientPrenom(c.getPatient() != null ? c.getPatient().getPrenom() : null)
                .idMedecin(c.getIdMedecin())
                .medecinNom(c.getMedecin() != null ? c.getMedecin().getNom() : null)
                .medecinPrenom(c.getMedecin() != null ? c.getMedecin().getPrenom() : null)
                .dateConsultation(c.getDateConsultation())
                .motifConsultation(c.getMotifConsultation())
                .histoireMaladie(c.getHistoireMaladie())
                .diagnostic(c.getDiagnostic())
                .traitementPrescris(c.getTraitementPrescris())
                .observations(c.getObservations())
                .temperature(c.getTemperature())
                .pouls(c.getPouls())
                .pressionSystolique(c.getPressionSystolique())
                .pressionDiastolique(c.getPressionDiastolique())
                .saturation(c.getSaturation())
                .glycemie(c.getGlycemie())
                .poids(c.getPoids())
                .taille(c.getTaille())
                .imc(c.getImc())
                .certificatMedical(c.getCertificatMedical())
                .arretTravailDebut(c.getArretTravailDebut())
                .arretTravailFin(c.getArretTravailFin())
                .evolution(c.getEvolution() != null ? c.getEvolution().name() : null)
                .prochainRdv(c.getProchainRdv())
                .notesConfidentielles(c.getNotesConfidentielles())
                .build();
    }
}
