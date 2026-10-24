package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.signevital.SigneVitalRequestDto;
import adc.gestion_hospitaliere.dto.signevital.SigneVitalResponseDto;
import adc.gestion_hospitaliere.service.SigneVitalService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/signes-vitaux")
@RequiredArgsConstructor
public class SigneVitalController {

    private final SigneVitalService service;

    @GetMapping("/patient/{idPatient}")
    public ResponseEntity<PagedResponse<SigneVitalResponseDto>> getByPatient(
            @PathVariable Integer idPatient,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(pageIndex - 1, 0), pageSize);
        Page<SigneVitalResponseDto> page = service.getByPatient(idPatient, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SigneVitalResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<SigneVitalResponseDto> create(@Valid @RequestBody SigneVitalRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SigneVitalResponseDto> update(@PathVariable Integer id, @Valid @RequestBody SigneVitalRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
