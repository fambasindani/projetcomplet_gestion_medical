package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.CategorieMedicament;
import adc.gestion_hospitaliere.Entity.Medicament;
import adc.gestion_hospitaliere.Repository.CategorieMedicamentRepository;
import adc.gestion_hospitaliere.Repository.MedicamentRepository;
import adc.gestion_hospitaliere.dto.medicament.MedicamentRequestDto;
import adc.gestion_hospitaliere.dto.medicament.MedicamentResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MedicamentService {

    private final MedicamentRepository medicamentRepository;
    private final CategorieMedicamentRepository categorieRepository;

    public Page<MedicamentResponseDto> getAll(Pageable pageable) {
        return medicamentRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<MedicamentResponseDto> search(String nom, Integer idCategorie, Boolean actif, Pageable pageable) {
        return medicamentRepository.search(nom, idCategorie, actif, pageable).map(this::toResponseDto);
    }

    public MedicamentResponseDto getById(Integer id) {
        Medicament m = medicamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé"));
        return toResponseDto(m);
    }

    @Transactional
    public MedicamentResponseDto create(MedicamentRequestDto dto) {
        if (medicamentRepository.existsByCodeCip(dto.getCodeCip())) {
            throw new BusinessException("Un médicament avec ce code CIP existe déjà");
        }
        Medicament m = new Medicament();
        updateEntity(m, dto);
        m = medicamentRepository.save(m);
        return toResponseDto(m);
    }

    @Transactional
    public MedicamentResponseDto update(Integer id, MedicamentRequestDto dto) {
        Medicament m = medicamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé"));
        if (medicamentRepository.existsByCodeCipAndIdMedicamentNot(dto.getCodeCip(), id)) {
            throw new BusinessException("Un autre médicament avec ce code CIP existe déjà");
        }
        updateEntity(m, dto);
        m = medicamentRepository.save(m);
        return toResponseDto(m);
    }

    @Transactional
    public void delete(Integer id) {
        Medicament m = medicamentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médicament non trouvé"));
        // Vérifier s'il est utilisé dans des prescriptions, commandes, lots, etc.
        if (m.getLots() != null && !m.getLots().isEmpty()) {
            throw new BusinessException("Impossible de supprimer un médicament qui a des lots");
        }
        if (m.getPrescriptions() != null && !m.getPrescriptions().isEmpty()) {
            throw new BusinessException("Impossible de supprimer un médicament associé à des prescriptions");
        }
        medicamentRepository.delete(m);
    }

    private void updateEntity(Medicament m, MedicamentRequestDto dto) {
        m.setCodeCip(dto.getCodeCip());
        m.setCodeCis(dto.getCodeCis());
        m.setNomCommercial(dto.getNomCommercial());
        m.setDenominationCommune(dto.getDenominationCommune());
        m.setFormePharmaceutique(dto.getFormePharmaceutique());
        m.setDosage(dto.getDosage());
        m.setPresentation(dto.getPresentation());
        m.setVoieAdministration(dto.getVoieAdministration());
        m.setIdCategorie(dto.getIdCategorie());
        m.setLaboratoire(dto.getLaboratoire());
        m.setSubstanceActive(dto.getSubstanceActive());
        m.setExcipients(dto.getExcipients());
        m.setIndications(dto.getIndications());
        m.setContreIndications(dto.getContreIndications());
        m.setEffetsSecondaires(dto.getEffetsSecondaires());
        m.setPrecautionsEmploi(dto.getPrecautionsEmploi());
        m.setConservationConditions(dto.getConservationConditions());
        m.setTemperatureConservation(dto.getTemperatureConservation());
        m.setDureeConservationMois(dto.getDureeConservationMois());
        m.setPrescriptionObligatoire(dto.getPrescriptionObligatoire() != null ? dto.getPrescriptionObligatoire() : false);
        m.setListePsychotrope(dto.getListePsychotrope() != null ? dto.getListePsychotrope() : false);
        m.setGenerique(dto.getGenerique() != null ? dto.getGenerique() : false);
        m.setIdGeneriqueParent(dto.getIdGeneriqueParent());
        m.setPrixAchat(dto.getPrixAchat());
        m.setPrixVente(dto.getPrixVente());
        m.setTauxRemboursement(dto.getTauxRemboursement());
        if (dto.getStockMinimum() != null) m.setStockMinimum(dto.getStockMinimum());
        if (dto.getStockMaximum() != null) m.setStockMaximum(dto.getStockMaximum());
        if (dto.getDatePeremptionAlerte() != null) m.setDatePeremptionAlerte(dto.getDatePeremptionAlerte());
        if (dto.getActif() != null) m.setActif(dto.getActif());
    }

    private MedicamentResponseDto toResponseDto(Medicament m) {
        String nomCategorie = null;
        if (m.getCategorie() != null) {
            nomCategorie = m.getCategorie().getNomCategorie();
        }
        String nomGeneriqueParent = null;
        if (m.getGeneriqueParent() != null) {
            nomGeneriqueParent = m.getGeneriqueParent().getNomCommercial();
        }
        return MedicamentResponseDto.builder()
                .idMedicament(m.getIdMedicament())
                .codeCip(m.getCodeCip())
                .codeCis(m.getCodeCis())
                .nomCommercial(m.getNomCommercial())
                .denominationCommune(m.getDenominationCommune())
                .formePharmaceutique(m.getFormePharmaceutique())
                .dosage(m.getDosage())
                .presentation(m.getPresentation())
                .voieAdministration(m.getVoieAdministration())
                .idCategorie(m.getIdCategorie())
                .nomCategorie(nomCategorie)
                .laboratoire(m.getLaboratoire())
                .substanceActive(m.getSubstanceActive())
                .excipients(m.getExcipients())
                .indications(m.getIndications())
                .contreIndications(m.getContreIndications())
                .effetsSecondaires(m.getEffetsSecondaires())
                .precautionsEmploi(m.getPrecautionsEmploi())
                .conservationConditions(m.getConservationConditions())
                .temperatureConservation(m.getTemperatureConservation())
                .dureeConservationMois(m.getDureeConservationMois())
                .prescriptionObligatoire(m.getPrescriptionObligatoire())
                .listePsychotrope(m.getListePsychotrope())
                .generique(m.getGenerique())
                .idGeneriqueParent(m.getIdGeneriqueParent())
                .nomGeneriqueParent(nomGeneriqueParent)
                .prixAchat(m.getPrixAchat())
                .prixVente(m.getPrixVente())
                .tauxRemboursement(m.getTauxRemboursement())
                .stockMinimum(m.getStockMinimum())
                .stockMaximum(m.getStockMaximum())
                .dateCreation(m.getDateCreation())
                .datePeremptionAlerte(m.getDatePeremptionAlerte())
                .actif(m.getActif())
                .build();
    }
}