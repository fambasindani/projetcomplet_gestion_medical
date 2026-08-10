package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.soin.SoinInfirmierRequestDto;
import adc.gestion_hospitaliere.dto.soin.SoinInfirmierResponseDto;
import adc.gestion_hospitaliere.service.SoinInfirmierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/soins-infirmiers")
@RequiredArgsConstructor
public class SoinInfirmierController {
    private final SoinInfirmierService service;

    // ⚠️ /search DOIT être avant /{id}
    @GetMapping("/search")
    public ResponseEntity<Page<SoinInfirmierResponseDto>> search(
            @RequestParam(required = false) String typeSoin,
            @RequestParam(required = false) Integer idHospitalisation,
            @RequestParam(required = false) Integer idInfirmier,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEnd,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(service.search(typeSoin, idHospitalisation, idInfirmier,
                dateStart, dateEnd, pageable));
    }

    @GetMapping("/hospitalisation/{hospitalisationId}")
    public ResponseEntity<List<SoinInfirmierResponseDto>> getByHospitalisation(@PathVariable Integer hospitalisationId) {
        return ResponseEntity.ok(service.getByHospitalisation(hospitalisationId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SoinInfirmierResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SoinInfirmierResponseDto> create(@Valid @RequestBody SoinInfirmierRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SoinInfirmierResponseDto> update(@PathVariable Integer id, @Valid @RequestBody SoinInfirmierRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}