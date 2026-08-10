package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;


import adc.gestion_hospitaliere.Entity.ConstanteHospitalisation;
import adc.gestion_hospitaliere.Repository.ConstanteHospitalisationRepository;
import adc.gestion_hospitaliere.Repository.HospitalisationRepository;
import adc.gestion_hospitaliere.dto.constante.ConstanteRequestDto;
import adc.gestion_hospitaliere.dto.constante.ConstanteResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConstanteService {

    private final ConstanteHospitalisationRepository constanteRepository;
    private final HospitalisationRepository hospitalisationRepository;

    public Page<ConstanteResponseDto> getConstantesByHospitalisation(Integer idHospitalisation, Pageable pageable) {
        return constanteRepository.findByIdHospitalisation(idHospitalisation, pageable)
                .map(this::toResponseDto);
    }

    public ConstanteResponseDto getConstanteById(Integer id) {
        ConstanteHospitalisation c = constanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Constante non trouvée avec l'id : " + id));
        return toResponseDto(c);
    }

    @Transactional
    public ConstanteResponseDto createConstante(ConstanteRequestDto dto) {
        // Vérifier que l'hospitalisation existe
        hospitalisationRepository.findById(dto.getIdHospitalisation())
                .orElseThrow(() -> new ResourceNotFoundException("Hospitalisation non trouvée avec l'id : " + dto.getIdHospitalisation()));

        ConstanteHospitalisation c = new ConstanteHospitalisation();
        updateEntityForCreate(c, dto);
        c = constanteRepository.save(c);
        return toResponseDto(c);
    }

    @Transactional
    public ConstanteResponseDto updateConstante(Integer id, ConstanteRequestDto dto) {
        ConstanteHospitalisation c = constanteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Constante non trouvée avec l'id : " + id));
        updateEntityForUpdate(c, dto);
        c = constanteRepository.save(c);
        return toResponseDto(c);
    }

    @Transactional
    public void deleteConstante(Integer id) {
        if (!constanteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Constante non trouvée avec l'id : " + id);
        }
        constanteRepository.deleteById(id);
    }

    /**
     * Remplit l'entité pour la création (tous les champs sont modifiables, y compris l'ID hospitalisation).
     */
    private void updateEntityForCreate(ConstanteHospitalisation c, ConstanteRequestDto dto) {
        c.setIdHospitalisation(dto.getIdHospitalisation());
        c.setDateMesure(dto.getDateMesure());
        c.setTemperature(dto.getTemperature());
        c.setPouls(dto.getPouls());
        c.setPressionSystolique(dto.getPressionSystolique());
        c.setPressionDiastolique(dto.getPressionDiastolique());
        c.setSaturation(dto.getSaturation());
        c.setFrequenceRespiratoire(dto.getFrequenceRespiratoire());
        c.setGlycemie(dto.getGlycemie());
        c.setDouleurEchelle(dto.getDouleurEchelle());
        c.setPrisePar(dto.getPrisePar());
        c.setObservations(dto.getObservations());
    }

    /**
     * Remplit l'entité pour la mise à jour : on ne modifie PAS l'ID hospitalisation,
     * car une constante ne doit pas être reassignée à une autre hospitalisation.
     */
    private void updateEntityForUpdate(ConstanteHospitalisation c, ConstanteRequestDto dto) {
        // c.setIdHospitalisation(dto.getIdHospitalisation()); // ← NE PAS FAIRE : l'hospitalisation ne change pas
        c.setDateMesure(dto.getDateMesure());
        c.setTemperature(dto.getTemperature());
        c.setPouls(dto.getPouls());
        c.setPressionSystolique(dto.getPressionSystolique());
        c.setPressionDiastolique(dto.getPressionDiastolique());
        c.setSaturation(dto.getSaturation());
        c.setFrequenceRespiratoire(dto.getFrequenceRespiratoire());
        c.setGlycemie(dto.getGlycemie());
        c.setDouleurEchelle(dto.getDouleurEchelle());
        c.setPrisePar(dto.getPrisePar());
        c.setObservations(dto.getObservations());
    }

    private ConstanteResponseDto toResponseDto(ConstanteHospitalisation c) {
        String hospitalisationNumero = null;
        if (c.getHospitalisation() != null) {
            hospitalisationNumero = c.getHospitalisation().getNumeroAdmission();
        }
        return ConstanteResponseDto.builder()
                .idConstante(c.getIdConstante())
                .idHospitalisation(c.getIdHospitalisation())
                .hospitalisationNumero(hospitalisationNumero)
                .dateMesure(c.getDateMesure())
                .temperature(c.getTemperature())
                .pouls(c.getPouls())
                .pressionSystolique(c.getPressionSystolique())
                .pressionDiastolique(c.getPressionDiastolique())
                .saturation(c.getSaturation())
                .frequenceRespiratoire(c.getFrequenceRespiratoire())
                .glycemie(c.getGlycemie())
                .douleurEchelle(c.getDouleurEchelle())
                .prisePar(c.getPrisePar())
                .observations(c.getObservations())
                .build();
    }
}