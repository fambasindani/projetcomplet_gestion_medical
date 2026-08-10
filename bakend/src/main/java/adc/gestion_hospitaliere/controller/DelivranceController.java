package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.delivrance.DelivranceRequestDto;
import adc.gestion_hospitaliere.dto.delivrance.DelivranceResponseDto;
import adc.gestion_hospitaliere.dto.delivrance.DelivranceUpdateDto;
import adc.gestion_hospitaliere.service.DelivranceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/delivrances")
@RequiredArgsConstructor
public class DelivranceController {

    private final DelivranceService service;

    @GetMapping
    public ResponseEntity<PagedResponse<DelivranceResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(defaultValue = "dateDelivrance,desc") String[] sort) {
        Pageable pageable = buildPageable(pageIndex, pageSize, sort);
        return ResponseEntity.ok(service.getAllDelivrances(pageable));
    }

    private Pageable buildPageable(int pageIndex, int pageSize, String[] sort) {
        int safeIndex = Math.max(pageIndex - 1, 0);
        if (sort != null && sort.length == 2) {
            try {
                Sort.Direction direction = Sort.Direction.fromString(sort[1]);
                return PageRequest.of(safeIndex, pageSize, Sort.by(direction, sort[0]));
            } catch (IllegalArgumentException ignored) {
                // direction invalide -> tri par défaut
            }
        }
        return PageRequest.of(safeIndex, pageSize, Sort.by(Sort.Direction.DESC, "dateDelivrance"));
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyAuthority('ADMIN', 'PHARMACIEN', 'MEDECIN')")
    public ResponseEntity<PagedResponse<DelivranceResponseDto>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(service.searchDelivrances(keyword, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<DelivranceResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getDelivranceById(id));
    }

    @PostMapping
    public ResponseEntity<DelivranceResponseDto> create(@Valid @RequestBody DelivranceRequestDto dto) {
        return ResponseEntity.ok(service.createDelivrance(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DelivranceResponseDto> updateDelivrance(
            @PathVariable Integer id,
            @Valid @RequestBody DelivranceUpdateDto dto) {
        // Optionnel : vérifier que l'ID du path correspond à celui du DTO
        if (!id.equals(dto.getIdDelivrance())) {
            throw new IllegalArgumentException("L'ID du path ne correspond pas à l'ID du body");
        }
        return ResponseEntity.ok(service.updateDelivrance(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.deleteDelivrance(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(service.getStatistiques());
    }
}