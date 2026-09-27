package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.laboratoire.*;
import adc.gestion_hospitaliere.service.LaboratoireService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/laboratoires")
@RequiredArgsConstructor
public class LaboratoireController {

    private final LaboratoireService service;

    // GET /api/laboratoires  (actifs seulement par défaut)
    @GetMapping
    public ResponseEntity<List<LaboratoireResponseDto>> getAll(
            @RequestParam(defaultValue = "true") boolean actifsSeulement) {
        return ResponseEntity.ok(service.findAll(actifsSeulement));
    }

    // GET /api/laboratoires/search : version paginée + filtres
    @GetMapping("/search")
    public ResponseEntity<adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse<LaboratoireResponseDto>> search(
            @RequestParam(required = false) Boolean actif,
            @RequestParam(required = false) String term,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        org.springframework.data.domain.Pageable pageable =
                org.springframework.data.domain.PageRequest.of(Math.max(pageIndex - 1, 0), pageSize);
        return ResponseEntity.ok(adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse.of(
                service.search(actif, term, pageable)));
    }

    // GET /api/laboratoires/tous  (y compris inactifs)
    @GetMapping("/tous")
    public ResponseEntity<List<LaboratoireResponseDto>> getAllIncludingInactive() {
        return ResponseEntity.ok(service.findAll(false));
    }

    // GET /api/laboratoires/{id}
    @GetMapping("/{id}")
    public ResponseEntity<LaboratoireResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.findById(id));
    }

    // POST /api/laboratoires
    @PostMapping
    public ResponseEntity<LaboratoireResponseDto> create(@Valid @RequestBody LaboratoireRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // PUT /api/laboratoires/{id}
    @PutMapping("/{id}")
    public ResponseEntity<LaboratoireResponseDto> update(
            @PathVariable Integer id, @Valid @RequestBody LaboratoireRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE /api/laboratoires/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // POST /api/laboratoires/affectations  (affecter un technicien à un labo)
    @PostMapping("/affectations")
    public ResponseEntity<LaboratoireResponseDto> affecter(@Valid @RequestBody AffectationLaboratoireDto dto) {
        return ResponseEntity.ok(service.affecter(dto));
    }

    // DELETE /api/laboratoires/affectations/{idPersonnel}
    @DeleteMapping("/affectations/{idPersonnel}")
    public ResponseEntity<Void> retirer(@PathVariable Integer idPersonnel) {
        service.retirerAffectation(idPersonnel);
        return ResponseEntity.noContent().build();
    }
}