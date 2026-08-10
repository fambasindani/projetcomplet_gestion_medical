package adc.gestion_hospitaliere.controller;


import adc.gestion_hospitaliere.Enums.StatutChambre;
import adc.gestion_hospitaliere.Enums.TypeChambre;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.chambre.ChambreRequestDto;
import adc.gestion_hospitaliere.dto.chambre.ChambreResponseDto;
import adc.gestion_hospitaliere.service.ChambreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chambres")
@RequiredArgsConstructor
public class ChambreController {

    private final ChambreService chambreService;

    @GetMapping
    public ResponseEntity<PagedResponse<ChambreResponseDto>> getAllChambres(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ChambreResponseDto> page = chambreService.getAllChambres(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<PagedResponse<ChambreResponseDto>> getByStatut(
            @PathVariable StatutChambre statut,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ChambreResponseDto> page = chambreService.getChambresByStatut(statut, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<PagedResponse<ChambreResponseDto>> getByType(
            @PathVariable TypeChambre type,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ChambreResponseDto> page = chambreService.getChambresByType(type, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<ChambreResponseDto>> searchChambres(
            @RequestParam(required = false) StatutChambre statut,
            @RequestParam(required = false) TypeChambre type,
            @RequestParam(required = false) Integer etage,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ChambreResponseDto> page = chambreService.searchChambres(statut, type, etage, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChambreResponseDto> getChambre(@PathVariable Integer id) {
        return ResponseEntity.ok(chambreService.getChambreById(id));
    }

    @PostMapping
    public ResponseEntity<ChambreResponseDto> createChambre(@Valid @RequestBody ChambreRequestDto dto) {
        return ResponseEntity.ok(chambreService.createChambre(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChambreResponseDto> updateChambre(@PathVariable Integer id, @Valid @RequestBody ChambreRequestDto dto) {
        return ResponseEntity.ok(chambreService.updateChambre(id, dto));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<ChambreResponseDto> changerStatut(@PathVariable Integer id, @RequestParam StatutChambre statut) {
        return ResponseEntity.ok(chambreService.changerStatut(id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteChambre(@PathVariable Integer id) {
        chambreService.deleteChambre(id);
        return ResponseEntity.noContent().build();
    }
}
