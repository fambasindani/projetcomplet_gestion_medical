package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;

import adc.gestion_hospitaliere.Entity.SigneVital;
import adc.gestion_hospitaliere.Repository.PatientRepository;
import adc.gestion_hospitaliere.Repository.SigneVitalRepository;
import adc.gestion_hospitaliere.dto.signevital.SigneVitalRequestDto;
import adc.gestion_hospitaliere.dto.signevital.SigneVitalResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class SigneVitalService {

    private final SigneVitalRepository signeVitalRepository;
    private final PatientRepository patientRepository;

    public Page<SigneVitalResponseDto> getByPatient(Integer idPatient, Pageable pageable) {
        return signeVitalRepository.findByIdPatientOrderByDateMesureDesc(idPatient, pageable)
                .map(this::toResponseDto);
    }

    public SigneVitalResponseDto getById(Integer id) {
        SigneVital s = signeVitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signe vital non trouvé avec l'id : " + id));
        return toResponseDto(s);
    }

    @Transactional
    public SigneVitalResponseDto create(SigneVitalRequestDto dto) {
        patientRepository.findById(dto.getIdPatient())
                .orElseThrow(() -> new ResourceNotFoundException("Patient non trouvé avec l'id : " + dto.getIdPatient()));

        SigneVital s = new SigneVital();
        apply(s, dto);
        s = signeVitalRepository.save(s);
        return toResponseDto(s);
    }

    @Transactional
    public SigneVitalResponseDto update(Integer id, SigneVitalRequestDto dto) {
        SigneVital s = signeVitalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Signe vital non trouvé avec l'id : " + id));
        apply(s, dto);
        s = signeVitalRepository.save(s);
        return toResponseDto(s);
    }

    @Transactional
    public void delete(Integer id) {
        if (!signeVitalRepository.existsById(id)) {
            throw new ResourceNotFoundException("Signe vital non trouvé avec l'id : " + id);
        }
        signeVitalRepository.deleteById(id);
    }

    private void apply(SigneVital s, SigneVitalRequestDto dto) {
        s.setIdPatient(dto.getIdPatient());
        s.setIdPersonnel(dto.getIdPersonnel());
        s.setDateMesure(dto.getDateMesure());
        s.setPoids(dto.getPoids());
        s.setTaille(dto.getTaille());
        s.setImc(calculerImc(dto.getPoids(), dto.getTaille()));
        s.setTemperature(dto.getTemperature());
        s.setPouls(dto.getPouls());
        s.setPressionSystolique(dto.getPressionSystolique());
        s.setPressionDiastolique(dto.getPressionDiastolique());
        s.setSaturation(dto.getSaturation());
        s.setFrequenceRespiratoire(dto.getFrequenceRespiratoire());
        s.setGlycemie(dto.getGlycemie());
        s.setDouleurEchelle(dto.getDouleurEchelle());
        s.setPrisePar(dto.getPrisePar());
        s.setObservations(dto.getObservations());
    }

    private BigDecimal calculerImc(BigDecimal poids, BigDecimal taille) {
        if (poids == null || taille == null) return null;
        BigDecimal tailleM = taille;
        if (tailleM.compareTo(BigDecimal.valueOf(3)) > 0) {
            // taille saisie en cm -> convertir en m
            tailleM = tailleM.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        }
        if (tailleM.signum() == 0) return null;
        return poids.divide(tailleM.multiply(tailleM), 2, RoundingMode.HALF_UP);
    }

    private SigneVitalResponseDto toResponseDto(SigneVital s) {
        String patientNom = s.getPatient() != null ? s.getPatient().getNom() : null;
        String patientPrenom = s.getPatient() != null ? s.getPatient().getPrenom() : null;
        String prisePar = s.getPrisePar();
        if ((prisePar == null || prisePar.isBlank()) && s.getPersonnel() != null) {
            prisePar = s.getPersonnel().getPrenom() + " " + s.getPersonnel().getNom();
        }
        return SigneVitalResponseDto.builder()
                .idSigneVital(s.getIdSigneVital())
                .idPatient(s.getIdPatient())
                .patientNom(patientNom)
                .patientPrenom(patientPrenom)
                .idPersonnel(s.getIdPersonnel())
                .prisePar(prisePar)
                .dateMesure(s.getDateMesure())
                .poids(s.getPoids())
                .taille(s.getTaille())
                .imc(s.getImc())
                .temperature(s.getTemperature())
                .pouls(s.getPouls())
                .pressionSystolique(s.getPressionSystolique())
                .pressionDiastolique(s.getPressionDiastolique())
                .saturation(s.getSaturation())
                .frequenceRespiratoire(s.getFrequenceRespiratoire())
                .glycemie(s.getGlycemie())
                .douleurEchelle(s.getDouleurEchelle())
                .observations(s.getObservations())
                .build();
    }
}
