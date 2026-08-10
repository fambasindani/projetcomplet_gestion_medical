package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.constante.ConstanteRequestDto;
import adc.gestion_hospitaliere.dto.constante.ConstanteResponseDto;
import adc.gestion_hospitaliere.service.ConstanteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/constantes")
@RequiredArgsConstructor
public class ConstanteController {

    private final ConstanteService service;

    @GetMapping("/hospitalisation/{idHospitalisation}")
    public ResponseEntity<PagedResponse<ConstanteResponseDto>> getByHospitalisation(
            @PathVariable Integer idHospitalisation,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ConstanteResponseDto> page = service.getConstantesByHospitalisation(idHospitalisation, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConstanteResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getConstanteById(id));
    }

    @PostMapping
    public ResponseEntity<ConstanteResponseDto> create(@Valid @RequestBody ConstanteRequestDto dto) {
        return ResponseEntity.ok(service.createConstante(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConstanteResponseDto> update(@PathVariable Integer id, @Valid @RequestBody ConstanteRequestDto dto) {
        return ResponseEntity.ok(service.updateConstante(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteConstante(id);
        return ResponseEntity.noContent().build();
    }
}