package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.medcin.*;
import adc.gestion_hospitaliere.service.MedecinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/medecins")
@RequiredArgsConstructor
public class MedecinController {

    private final MedecinService medecinService;

    @GetMapping
    public ResponseEntity<PagedResponse<MedecinResponseDto>> getAllMedecins(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<MedecinResponseDto> page = medecinService.getAllMedecins(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedecinResponseDto> getMedecin(@PathVariable Integer id) {
        return ResponseEntity.ok(medecinService.getMedecinById(id));
    }

    @PostMapping
    public ResponseEntity<MedecinResponseDto> createMedecin(@Valid @RequestBody MedecinRequestDto dto) {
        MedecinResponseDto created = medecinService.createMedecin(dto);
        return ResponseEntity.created(URI.create("/api/medecins/" + created.getIdMedecin())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedecinResponseDto> updateMedecin(@PathVariable Integer id,
                                                            @Valid @RequestBody MedecinUpdateDto dto) {
        MedecinResponseDto updated = medecinService.updateMedecin(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedecin(@PathVariable Integer id) {
        medecinService.deleteMedecin(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/photo")
    public ResponseEntity<Void> updatePhoto(@PathVariable Integer id,
                                            @Valid @RequestBody PhotoUpdateDto photoDto) {
        medecinService.updatePhoto(id, photoDto.getPhoto());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/disponibilite")
    public ResponseEntity<Void> updateDisponibilite(@PathVariable Integer id,
                                                    @Valid @RequestBody DisponibiliteUpdateDto dto) {
        medecinService.updateDisponibilite(id, dto.getDisponibilite());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/recherche/{term}")
    public ResponseEntity<PagedResponse<MedecinResponseDto>> rechercherMedecins(
            @PathVariable String term,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<MedecinResponseDto> page = medecinService.searchMedecins(term, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/specialite/{specialiteId}")
    public ResponseEntity<PagedResponse<MedecinResponseDto>> getMedecinsBySpecialite(
            @PathVariable Integer specialiteId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<MedecinResponseDto> page = medecinService.getMedecinsBySpecialite(specialiteId, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/disponibles")
    public ResponseEntity<PagedResponse<MedecinResponseDto>> getMedecinsDisponibles(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        int safePageIndex = Math.max(pageIndex, 1);
        int safePageSize = Math.min(Math.max(pageSize, 1), 100);
        Pageable pageable = PageRequest.of(safePageIndex - 1, safePageSize);
        Page<MedecinResponseDto> page = medecinService.getMedecinsDisponibles(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(medecinService.getStatistiques());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getMedecinDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(medecinService.getMedecinDetails(id));
    }
}