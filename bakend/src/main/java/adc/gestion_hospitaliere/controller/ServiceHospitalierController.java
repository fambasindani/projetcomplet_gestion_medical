package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.service.*;
import adc.gestion_hospitaliere.service.ServiceHospitalierService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceHospitalierController {

    private final ServiceHospitalierService service;

    @GetMapping
    public ResponseEntity<List<ServiceResponseDto>> getAll(
            @RequestParam(defaultValue = "true") boolean actifsSeulement) {
        return ResponseEntity.ok(service.findAll(actifsSeulement));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<ServiceResponseDto>> search(
            @RequestParam(required = false) Boolean actif,
            @RequestParam(required = false) String term,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(pageIndex - 1, 0), pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.search(actif, term, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ServiceResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    @PostMapping
    public ResponseEntity<ServiceResponseDto> create(@Valid @RequestBody ServiceRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ServiceResponseDto> update(@PathVariable Integer id, @Valid @RequestBody ServiceRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/affectations")
    public ResponseEntity<ServiceResponseDto> affecter(@Valid @RequestBody AffectationServiceDto dto) {
        return ResponseEntity.ok(service.affecter(dto));
    }

    @DeleteMapping("/affectations/{idPersonnel}")
    public ResponseEntity<Void> retirer(@PathVariable Integer idPersonnel) {
        service.retirerAffectation(idPersonnel);
        return ResponseEntity.noContent().build();
    }
}