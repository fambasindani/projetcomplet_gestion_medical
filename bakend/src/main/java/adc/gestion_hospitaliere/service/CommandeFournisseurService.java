package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;

import adc.gestion_hospitaliere.Entity.*;
import adc.gestion_hospitaliere.Enums.StatutCommandeFournisseur;
import adc.gestion_hospitaliere.Repository.*;
import adc.gestion_hospitaliere.dto.commande.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommandeFournisseurService {

    private final CommandeFournisseurRepository commandeRepository;
    private final FournisseurPharmaRepository fournisseurRepository;
    private final MedicamentRepository medicamentRepository;
    private final PersonnelRepository personnelRepository;
    private final DetailsCommandeFournisseurRepository detailsRepository;

    private String generateNumeroCommande() {
        String prefix = "CMD-";
        String year = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        long count = commandeRepository.count() + 1;
        return prefix + year + "-" + String.format("%03d", count);
    }

    public Page<CommandeFournisseurResponseDto> getAll(Pageable pageable) {
        return commandeRepository.findAll(pageable).map(this::toResponseDto);
    }

    public Page<CommandeFournisseurResponseDto> search(StatutCommandeFournisseur statut,
                                                       Integer idFournisseur,
                                                       LocalDateTime dateStart,
                                                       LocalDateTime dateEnd,
                                                       Pageable pageable) {
        return commandeRepository.search(statut, idFournisseur, dateStart, dateEnd, pageable)
                .map(this::toResponseDto);
    }

    public CommandeFournisseurResponseDto getById(Integer id) {
        CommandeFournisseur cmd = commandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée"));
        return toResponseDto(cmd);
    }

    @Transactional
    public CommandeFournisseurResponseDto create(CommandeFournisseurRequestDto dto) {
        // Vérifier fournisseur
        FournisseurPharma fournisseur = fournisseurRepository.findById(dto.getIdFournisseur())
                .orElseThrow(() -> new ResourceNotFoundException("Fournisseur non trouvé"));
        // Générer numéro commande
        String numero = dto.getNumeroCommande() != null && !dto.getNumeroCommande().isBlank()
                ? dto.getNumeroCommande() : generateNumeroCommande();

        CommandeFournisseur cmd = new CommandeFournisseur();
        cmd.setNumeroCommande(numero);
        cmd.setIdFournisseur(dto.getIdFournisseur());
        cmd.setDateLivraisonPrevue(dto.getDateLivraisonPrevue());
        cmd.setDateLivraisonReelle(dto.getDateLivraisonReelle());
        cmd.setStatut(dto.getStatut() != null ? dto.getStatut() : StatutCommandeFournisseur.En_attente);
        cmd.setMontantTotal(dto.getMontantTotal());
        cmd.setModePaiement(dto.getModePaiement());
        cmd.setPaiementEffectue(dto.getPaiementEffectue() != null ? dto.getPaiementEffectue() : false);
        cmd.setNotes(dto.getNotes());
        cmd.setCommandePar(dto.getCommandePar());

        CommandeFournisseur saved = commandeRepository.save(cmd);

        // Enregistrer les détails
        if (dto.getDetails() != null) {
            for (DetailCommandeRequestDto detailDto : dto.getDetails()) {
                DetailsCommandeFournisseur detail = new DetailsCommandeFournisseur();
                detail.setIdCommande(saved.getIdCommande());
                detail.setIdMedicament(detailDto.getIdMedicament());
                detail.setQuantiteCommandee(detailDto.getQuantiteCommandee());
                detail.setQuantiteRecue(detailDto.getQuantiteRecue() != null ? detailDto.getQuantiteRecue() : 0);
                detail.setPrixUnitaire(detailDto.getPrixUnitaire());
                detail.setRemise(detailDto.getRemise() != null ? detailDto.getRemise() : BigDecimal.ZERO);
                // Calcul total ligne
                BigDecimal total = detailDto.getPrixUnitaire()
                        .multiply(BigDecimal.valueOf(detailDto.getQuantiteCommandee()))
                        .multiply(BigDecimal.ONE.subtract(detailDto.getRemise().divide(BigDecimal.valueOf(100))));
                detail.setTotalLigne(total);
                detailsRepository.save(detail);
            }
        }

        return toResponseDto(saved);
    }

    @Transactional
    public CommandeFournisseurResponseDto update(Integer id, CommandeFournisseurRequestDto dto) {
        CommandeFournisseur cmd = commandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commande non trouvée"));
        cmd.setDateLivraisonPrevue(dto.getDateLivraisonPrevue());
        cmd.setDateLivraisonReelle(dto.getDateLivraisonReelle());
        if (dto.getStatut() != null) cmd.setStatut(dto.getStatut());
        cmd.setMontantTotal(dto.getMontantTotal());
        cmd.setModePaiement(dto.getModePaiement());
        cmd.setPaiementEffectue(dto.getPaiementEffectue());
        cmd.setNotes(dto.getNotes());
        cmd.setCommandePar(dto.getCommandePar());
        // Mise à jour des détails : on supprime les anciens et on recrée (simplifié)
        detailsRepository.deleteByIdCommande(id);
        if (dto.getDetails() != null) {
            for (DetailCommandeRequestDto detailDto : dto.getDetails()) {
                DetailsCommandeFournisseur detail = new DetailsCommandeFournisseur();
                detail.setIdCommande(cmd.getIdCommande());
                detail.setIdMedicament(detailDto.getIdMedicament());
                detail.setQuantiteCommandee(detailDto.getQuantiteCommandee());
                detail.setQuantiteRecue(detailDto.getQuantiteRecue() != null ? detailDto.getQuantiteRecue() : 0);
                detail.setPrixUnitaire(detailDto.getPrixUnitaire());
                detail.setRemise(detailDto.getRemise() != null ? detailDto.getRemise() : BigDecimal.ZERO);
                BigDecimal total = detailDto.getPrixUnitaire()
                        .multiply(BigDecimal.valueOf(detailDto.getQuantiteCommandee()))
                        .multiply(BigDecimal.ONE.subtract(detailDto.getRemise().divide(BigDecimal.valueOf(100))));
                detail.setTotalLigne(total);
                detailsRepository.save(detail);
            }
        }
        return toResponseDto(commandeRepository.save(cmd));
    }

    @Transactional
    public void delete(Integer id) {
        detailsRepository.deleteByIdCommande(id);
        commandeRepository.deleteById(id);
    }

    private CommandeFournisseurResponseDto toResponseDto(CommandeFournisseur cmd) {
        String fournisseurNom = cmd.getFournisseur() != null ? cmd.getFournisseur().getNomFournisseur() : null;
        String commandeurNom = null;
        if (cmd.getCommandeur() != null) commandeurNom = cmd.getCommandeur().getNom() + " " + cmd.getCommandeur().getPrenom();
        List<DetailCommandeResponseDto> details = cmd.getDetails().stream()
                .map(d -> {
                    String medNom = d.getMedicament() != null ? d.getMedicament().getNomCommercial() : null;
                    return DetailCommandeResponseDto.builder()
                            .idDetailCommande(d.getIdDetailCommande())
                            .idMedicament(d.getIdMedicament())
                            .medicamentNom(medNom)
                            .quantiteCommandee(d.getQuantiteCommandee())
                            .quantiteRecue(d.getQuantiteRecue())
                            .prixUnitaire(d.getPrixUnitaire())
                            .remise(d.getRemise())
                            .totalLigne(d.getTotalLigne())
                            .build();
                })
                .collect(Collectors.toList());

        return CommandeFournisseurResponseDto.builder()
                .idCommande(cmd.getIdCommande())
                .numeroCommande(cmd.getNumeroCommande())
                .idFournisseur(cmd.getIdFournisseur())
                .fournisseurNom(fournisseurNom)
                .dateCommande(cmd.getDateCommande())
                .dateLivraisonPrevue(cmd.getDateLivraisonPrevue())
                .dateLivraisonReelle(cmd.getDateLivraisonReelle())
                .statut(cmd.getStatut())
                .montantTotal(cmd.getMontantTotal())
                .modePaiement(cmd.getModePaiement())
                .paiementEffectue(cmd.getPaiementEffectue())
                .notes(cmd.getNotes())
                .commandePar(cmd.getCommandePar())
                .commandeurNom(commandeurNom)
                .details(details)
                .build();
    }
}