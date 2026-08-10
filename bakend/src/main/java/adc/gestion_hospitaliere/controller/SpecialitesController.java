package adc.gestion_hospitaliere.controller;


import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.Specialites.SpecialiteRequestDto;
import adc.gestion_hospitaliere.dto.Specialites.SpecialiteResponseDto;
import adc.gestion_hospitaliere.service.SpecialiteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/specialites")
@RequiredArgsConstructor
public class SpecialitesController {

    private final SpecialiteService specialiteService;

    @GetMapping
    public ResponseEntity<PagedResponse<SpecialiteResponseDto>> getAllSpecialites(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<SpecialiteResponseDto> page = specialiteService.getAllSpecialites(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/actives")
    public ResponseEntity<PagedResponse<SpecialiteResponseDto>> getSpecialitesActives(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<SpecialiteResponseDto> page = specialiteService.getSpecialitesActives(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SpecialiteResponseDto> getSpecialite(@PathVariable Integer id) {
        return ResponseEntity.ok(specialiteService.getSpecialiteById(id));
    }

    @GetMapping("/recherche/{nom}")
    public ResponseEntity<PagedResponse<SpecialiteResponseDto>> rechercherSpecialites(
            @PathVariable String nom,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<SpecialiteResponseDto> page = specialiteService.rechercherSpecialites(nom, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @PostMapping
    public ResponseEntity<SpecialiteResponseDto> createSpecialite(@Valid @RequestBody SpecialiteRequestDto requestDto) {
        return ResponseEntity.ok(specialiteService.createSpecialite(requestDto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SpecialiteResponseDto> updateSpecialite(
            @PathVariable Integer id,
            @Valid @RequestBody SpecialiteRequestDto requestDto) {
        return ResponseEntity.ok(specialiteService.updateSpecialite(id, requestDto));
    }

    @PatchMapping("/{id}/desactiver")
    public ResponseEntity<Void> desactiverSpecialite(@PathVariable Integer id) {
        specialiteService.toggleActivation(id, false);
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/{id}/activer")
    public ResponseEntity<Void> activerSpecialite(@PathVariable Integer id) {
        specialiteService.toggleActivation(id, true);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSpecialite(@PathVariable Integer id) {
        specialiteService.deleteSpecialite(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/sans-medecins")
    public ResponseEntity<PagedResponse<SpecialiteResponseDto>> getSpecialitesSansMedecins(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<SpecialiteResponseDto> page = specialiteService.getSpecialitesSansMedecins(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/avec-medecins")
    public ResponseEntity<PagedResponse<SpecialiteResponseDto>> getSpecialitesAvecMedecins(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<SpecialiteResponseDto> page = specialiteService.getSpecialitesAvecMedecins(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/statistiques")
    public ResponseEntity<Object> getStatistiques() {
        return ResponseEntity.ok(specialiteService.getStatistiques());
    }
}