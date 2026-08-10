package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.medicament.MedicamentRequestDto;
import adc.gestion_hospitaliere.dto.medicament.MedicamentResponseDto;
import adc.gestion_hospitaliere.service.MedicamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/medicaments")
@RequiredArgsConstructor
public class MedicamentController {

    private final MedicamentService service;

    @GetMapping
    public ResponseEntity<PagedResponse<MedicamentResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.getAll(pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<MedicamentResponseDto>> search(
            @RequestParam(required = false) String nom,
            @RequestParam(required = false) Integer idCategorie,
            @RequestParam(required = false) Boolean actif,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.search(nom, idCategorie, actif, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicamentResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<MedicamentResponseDto> create(@Valid @RequestBody MedicamentRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicamentResponseDto> update(@PathVariable Integer id, @Valid @RequestBody MedicamentRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}