package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.StatutFacture;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.facture.ElementFacturableDto;
import adc.gestion_hospitaliere.dto.facture.FactureRequestDto;
import adc.gestion_hospitaliere.dto.facture.FactureResponseDto;
import adc.gestion_hospitaliere.dto.facture.FactureStatsDto;
import adc.gestion_hospitaliere.dto.facture.PaiementRequestDto;
import adc.gestion_hospitaliere.dto.facture.PaiementResponseDto;
import adc.gestion_hospitaliere.service.FactureService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/factures")
@RequiredArgsConstructor
public class FactureController {

    private final FactureService factureService;

    @GetMapping
    public ResponseEntity<PagedResponse<FactureResponseDto>> getAllFactures(
            @RequestParam(required = false) StatutFacture statut,
            @RequestParam(required = false) Integer idPatient,
            @RequestParam(required = false) LocalDateTime dateStart,
            @RequestParam(required = false) LocalDateTime dateEnd,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<FactureResponseDto> page = factureService.getAllFactures(statut, idPatient, dateStart, dateEnd, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    // AVANT /{id} pour ne pas être capturé par la variable de chemin
    @GetMapping("/statistiques")
    public ResponseEntity<FactureStatsDto> getStatistiques() {
        return ResponseEntity.ok(factureService.getStatistiques());
    }

    @GetMapping("/elements/{idPatient}")
    public ResponseEntity<PagedResponse<ElementFacturableDto>> getElementsFacturables(
            @PathVariable Integer idPatient,
            @RequestParam(required = false) Integer idConsultation,
            @RequestParam(required = false) Integer idHospitalisation,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "100") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ElementFacturableDto> page = factureService.getElementsFacturables(idPatient, idConsultation, idHospitalisation, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FactureResponseDto> getFacture(@PathVariable Integer id) {
        return ResponseEntity.ok(factureService.getFactureById(id));
    }

    @PostMapping
    public ResponseEntity<FactureResponseDto> createFacture(@Valid @RequestBody FactureRequestDto dto) {
        return ResponseEntity.ok(factureService.createFacture(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FactureResponseDto> updateFacture(@PathVariable Integer id, @Valid @RequestBody FactureRequestDto dto) {
        return ResponseEntity.ok(factureService.updateFacture(id, dto));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<FactureResponseDto> annulerFacture(@PathVariable Integer id) {
        return ResponseEntity.ok(factureService.annulerFacture(id));
    }

    @PostMapping("/{id}/paiements")
    public ResponseEntity<FactureResponseDto> ajouterPaiement(
            @PathVariable Integer id,
            @Valid @RequestBody PaiementRequestDto dto) {
        return ResponseEntity.ok(factureService.ajouterPaiement(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFacture(@PathVariable Integer id) {
        factureService.deleteFacture(id);
        return ResponseEntity.noContent().build();
    }
}
