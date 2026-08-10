package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.StatutInventaire;
import adc.gestion_hospitaliere.Enums.TypeInventaire;
import adc.gestion_hospitaliere.dto.Inventairepharmacie.InventaireResponseDto;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.inventaire.InventaireRequestDto;
import adc.gestion_hospitaliere.service.InventairePharmacieService;
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
@RequestMapping("/api/inventaires")
@RequiredArgsConstructor
public class InventairepharmacieController {




        private final InventairePharmacieService service;

        @GetMapping
        public ResponseEntity<PagedResponse<InventaireResponseDto>> search(
                @RequestParam(required = false) StatutInventaire statut,
                @RequestParam(required = false) TypeInventaire type,
                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
                @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
                @RequestParam(defaultValue = "1") int pageIndex,
                @RequestParam(defaultValue = "10") int pageSize) {
            Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
            Page<InventaireResponseDto> page = service.search(statut, type, start, end, pageable);
            return ResponseEntity.ok(PagedResponse.of(page));
        }

        @GetMapping("/{id}")
        public ResponseEntity<InventaireResponseDto> getById(@PathVariable Integer id) {
            return ResponseEntity.ok(service.getById(id));
        }

        @PostMapping
        public ResponseEntity<InventaireResponseDto> create(@Valid @RequestBody InventaireRequestDto dto) {
            return ResponseEntity.ok(service.create(dto));
        }

        @PatchMapping("/{id}/valider")
        public ResponseEntity<InventaireResponseDto> valider(
                @PathVariable Integer id,
                @RequestParam Integer validePar) {
            return ResponseEntity.ok(service.valider(id, validePar));
        }

        @DeleteMapping("/{id}")
        public ResponseEntity<Void> delete(@PathVariable Integer id) {
            service.delete(id);
            return ResponseEntity.noContent().build();
        }
    }










