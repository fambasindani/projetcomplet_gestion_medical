package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.fournisseur.FournisseurRequestDto;
import adc.gestion_hospitaliere.dto.fournisseur.FournisseurResponseDto;
import adc.gestion_hospitaliere.service.FournisseurService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/fournisseurs")
@RequiredArgsConstructor
public class FournisseurController {

    private final FournisseurService service;

    @GetMapping
    public ResponseEntity<PagedResponse<FournisseurResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.getAll(pageable)));
    }

    // Méthode search unifiée avec nom, actif, pageIndex, pageSize
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<FournisseurResponseDto>> search(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) Boolean actif,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<FournisseurResponseDto> page = service.search(nom, actif, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FournisseurResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<FournisseurResponseDto> create(@Valid @RequestBody FournisseurRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FournisseurResponseDto> update(@PathVariable Integer id, @Valid @RequestBody FournisseurRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}