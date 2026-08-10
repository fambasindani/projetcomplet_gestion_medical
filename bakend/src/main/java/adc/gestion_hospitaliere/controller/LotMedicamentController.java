package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.StatutLot;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.lot.LotRequestDto;
import adc.gestion_hospitaliere.dto.lot.LotResponseDto;
import adc.gestion_hospitaliere.service.LotMedicamentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/lots")
@RequiredArgsConstructor
public class LotMedicamentController {

    private final LotMedicamentService service;

    @GetMapping
    public ResponseEntity<PagedResponse<LotResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<LotResponseDto> page = service.getAll(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<LotResponseDto>> search(
            @RequestParam(required = false) Integer idMedicament,
            @RequestParam(required = false) String numeroLot,
            @RequestParam(required = false) StatutLot statut,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<LotResponseDto> page = service.search(idMedicament, numeroLot, statut, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<LotResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<LotResponseDto> create(@Valid @RequestBody LotRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<LotResponseDto> update(@PathVariable Integer id, @Valid @RequestBody LotRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}