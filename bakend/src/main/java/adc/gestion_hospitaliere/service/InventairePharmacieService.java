package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;

import adc.gestion_hospitaliere.Entity.*;
import adc.gestion_hospitaliere.Enums.StatutInventaire;
import adc.gestion_hospitaliere.Enums.TypeInventaire;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.Inventairepharmacie.InventaireResponseDto;
import adc.gestion_hospitaliere.dto.Inventairepharmacie.LigneInventaireRequestDto;
import adc.gestion_hospitaliere.dto.Inventairepharmacie.LigneInventaireResponseDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventairePharmacieService {


        private final InventairePharmacieRepository inventaireRepository;
        private final LigneInventaireRepository ligneRepository;
        private final MedicamentRepository medicamentRepository;
        private final LotMedicamentRepository lotMedicamentRepository;
        private final PersonnelRepository personnelRepository;

        // ---------- READ ----------

        public Page<InventaireResponseDto> getAll(Pageable pageable) {
            return inventaireRepository.findAll(pageable).map(this::toDto);
        }

        public Page<InventaireResponseDto> search(StatutInventaire statut, TypeInventaire type,
                                                  LocalDateTime start, LocalDateTime end, Pageable pageable) {
            return inventaireRepository.search(statut, type, start, end, pageable).map(this::toDto);
        }

        public InventaireResponseDto getById(Integer id) {
            InventairePharmacie inv = inventaireRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Inventaire non trouvé"));
            return toDto(inv);
        }

        // ---------- CREATE ----------

        @Transactional
        public InventaireResponseDto create(adc.gestion_hospitaliere.dto.inventaire.InventaireRequestDto dto) {
            // 1. Créer l'inventaire
            InventairePharmacie inv = InventairePharmacie.builder()
                    .dateInventaire(dto.getDateInventaire())
                    .typeInventaire(dto.getTypeInventaire())
                    .realisePar(dto.getRealisePar())
                    .observations(dto.getObservations())
                    .statut(StatutInventaire.En_cours)
                    .build();
            if (dto.getValidePar() != null) {
                inv.setValidePar(dto.getValidePar());
            }
            inv = inventaireRepository.save(inv);

            // 2. Ajouter les lignes
            List<LigneInventaire> lignes = new ArrayList<>();
            for (LigneInventaireRequestDto ligneDto : dto.getLignes()) {
                // Vérifier que le lot existe
                LotMedicament lot = lotMedicamentRepository.findById(ligneDto.getIdLot())
                        .orElseThrow(() -> new ResourceNotFoundException("Lot non trouvé"));

                // Calculer l'écart
                int ecart = ligneDto.getQuantiteTheorique() - ligneDto.getQuantiteReelle();

                // Prix unitaire : si fourni dans le DTO, sinon on prend celui du lot
                BigDecimal prixUnitaire = ligneDto.getPrixUnitaire() != null ?
                        ligneDto.getPrixUnitaire() :
                        lot.getPrixAchatUnitaire() != null ? lot.getPrixAchatUnitaire() : BigDecimal.ZERO;

                // Valeur de l'écart
                BigDecimal valeurEcart = prixUnitaire.multiply(BigDecimal.valueOf(Math.abs(ecart)));

                LigneInventaire ligne = LigneInventaire.builder()
                        .idInventaire(inv.getIdInventaire())
                        .idMedicament(ligneDto.getIdMedicament())
                        .idLot(ligneDto.getIdLot())
                        .quantiteTheorique(ligneDto.getQuantiteTheorique())
                        .quantiteReelle(ligneDto.getQuantiteReelle())
                        .ecart(ecart)
                        .raisonEcart(ligneDto.getRaisonEcart())
                        .prixUnitaire(prixUnitaire)
                        .valeurEcart(valeurEcart)
                        .build();
                lignes.add(ligne);
            }
            ligneRepository.saveAll(lignes);
            return toDto(inv);
        }

        // ---------- VALIDER ----------

        @Transactional
        public InventaireResponseDto valider(Integer id, Integer validePar) {
            InventairePharmacie inv = inventaireRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Inventaire non trouvé"));

            if (inv.getStatut() != StatutInventaire.En_cours) {
                throw new BusinessException("Seul un inventaire en cours peut être validé");
            }

            inv.setStatut(StatutInventaire.Validé);
            inv.setDateValidation(LocalDateTime.now());
            inv.setValidePar(validePar);
            inv = inventaireRepository.save(inv);
            return toDto(inv);
        }

        // ---------- DELETE ----------

        @Transactional
        public void delete(Integer id) {
            ligneRepository.deleteByIdInventaire(id);
            inventaireRepository.deleteById(id);
        }

        // ---------- CONVERSION ----------

        private InventaireResponseDto toDto(InventairePharmacie inv) {
            List<LigneInventaire> lignes = ligneRepository.findByIdInventaire(inv.getIdInventaire());
            List<LigneInventaireResponseDto> ligneDtos = lignes.stream().map(ligne -> {
                String medicamentNom = medicamentRepository.findById(ligne.getIdMedicament())
                        .map(Medicament::getNomCommercial).orElse(null);
                String lotNumero = lotMedicamentRepository.findById(ligne.getIdLot())
                        .map(LotMedicament::getNumeroLot).orElse(null);
                return LigneInventaireResponseDto.builder()
                        .idLigneInventaire(ligne.getIdLigneInventaire())
                        .idMedicament(ligne.getIdMedicament())
                        .medicamentNom(medicamentNom)
                        .idLot(ligne.getIdLot())
                        .lotNumero(lotNumero)
                        .quantiteTheorique(ligne.getQuantiteTheorique())
                        .quantiteReelle(ligne.getQuantiteReelle())
                        .ecart(ligne.getEcart())
                        .raisonEcart(ligne.getRaisonEcart())
                        .prixUnitaire(ligne.getPrixUnitaire())
                        .valeurEcart(ligne.getValeurEcart())
                        .build();
            }).collect(Collectors.toList());

            String realisateurNom = personnelRepository.findById(inv.getRealisePar())
                    .map(Personnel::getNom).orElse(null);
            String validateurNom = inv.getValidePar() != null ?
                    personnelRepository.findById(inv.getValidePar()).map(Personnel::getNom).orElse(null) : null;

            return InventaireResponseDto.builder()
                    .idInventaire(inv.getIdInventaire())
                    .dateInventaire(inv.getDateInventaire())
                    .typeInventaire(inv.getTypeInventaire())
                    .realisePar(inv.getRealisePar())
                    .realisateurNom(realisateurNom)
                    .validePar(inv.getValidePar())
                    .validateurNom(validateurNom)
                    .dateValidation(inv.getDateValidation())
                    .observations(inv.getObservations())
                    .statut(inv.getStatut())
                    .lignes(ligneDtos)
                    .build();
        }
    }