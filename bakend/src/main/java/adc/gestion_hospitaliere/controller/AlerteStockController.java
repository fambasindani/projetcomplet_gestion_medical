package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.TypeAlerteStock;
import adc.gestion_hospitaliere.dto.Alerte.AlerteStockRequestDto;
import adc.gestion_hospitaliere.dto.Alerte.AlerteStockResponseDto;
import adc.gestion_hospitaliere.dto.Alerte.AlerteStockUpdateDto;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.service.AlerteStockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/alertes-stock")
@RequiredArgsConstructor
public class AlerteStockController {

    private final AlerteStockService service;

    // ---------- RECHERCHE AVEC FILTRES ----------
    @GetMapping
    public ResponseEntity<PagedResponse<AlerteStockResponseDto>> search(
            @RequestParam(required = false) TypeAlerteStock type,
            @RequestParam(required = false) Boolean traitee,
            @RequestParam(required = false) Integer idMedicament,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<AlerteStockResponseDto> page = service.search(type, traitee, idMedicament, start, end, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    // ---------- RÉCUPÉRATION PAR ID ----------
    @GetMapping("/{id}")
    public ResponseEntity<AlerteStockResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // ---------- CRÉATION ----------
    @PostMapping
    public ResponseEntity<AlerteStockResponseDto> create(@Valid @RequestBody AlerteStockRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // ---------- MISE À JOUR COMPLÈTE ----------
    @PutMapping("/{id}")
    public ResponseEntity<AlerteStockResponseDto> update(@PathVariable Integer id, @Valid @RequestBody AlerteStockRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // ---------- TRAITER UNE ALERTE (PATCH) ----------
    @PatchMapping("/{id}/traiter")
    public ResponseEntity<AlerteStockResponseDto> traiter(@PathVariable Integer id, @Valid @RequestBody AlerteStockUpdateDto dto) {
        return ResponseEntity.ok(service.traiterAlerte(id, dto));
    }

    // ---------- SUPPRESSION ----------
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- GÉNÉRATION MANUELLE DES ALERTES ----------
    @PostMapping("/verifier")
    public ResponseEntity<String> verifierAlertes() {
        service.genererAlertesManuellement();
        return ResponseEntity.ok("Vérification des alertes lancée");
    }
}