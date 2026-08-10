package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.dto.SoinPrescrit.SoinPrescritRequestDto;
import adc.gestion_hospitaliere.dto.SoinPrescrit.SoinPrescritResponseDto;
import adc.gestion_hospitaliere.service.SoinPrescritService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/soins-prescriptions")
@RequiredArgsConstructor
public class SoinPrescritController {

    private final SoinPrescritService service;

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<SoinPrescritResponseDto>> getByPrescription(@PathVariable Integer prescriptionId) {
        return ResponseEntity.ok(service.getByPrescription(prescriptionId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SoinPrescritResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SoinPrescritResponseDto> create(@Valid @RequestBody SoinPrescritRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SoinPrescritResponseDto> update(@PathVariable Integer id, @Valid @RequestBody SoinPrescritRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
