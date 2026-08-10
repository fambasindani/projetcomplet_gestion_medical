package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.urgence.InterventionUrgenceRequestDto;
import adc.gestion_hospitaliere.dto.urgence.InterventionUrgenceResponseDto;
import adc.gestion_hospitaliere.service.InterventionUrgenceService;
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
@RequestMapping("/api/urgences/interventions")
@RequiredArgsConstructor
public class InterventionUrgenceController {

    private final InterventionUrgenceService service;

    @GetMapping
    public ResponseEntity<PagedResponse<InterventionUrgenceResponseDto>> getAll(
            @RequestParam(required = false) StatutInterventionUrgence statut,
            @RequestParam(required = false) Integer idPatient,
            @RequestParam(required = false) Integer idMedecin,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEnd,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.search(statut, idPatient, idMedecin, dateStart, dateEnd, pageable)));
    }

    @GetMapping("/admission/{idAdmission}")
    public ResponseEntity<List<InterventionUrgenceResponseDto>> getByAdmission(@PathVariable Integer idAdmission) {
        return ResponseEntity.ok(service.getByAdmission(idAdmission));
    }

    @GetMapping("/{id}")
    public ResponseEntity<InterventionUrgenceResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<InterventionUrgenceResponseDto> create(@Valid @RequestBody InterventionUrgenceRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InterventionUrgenceResponseDto> update(@PathVariable Integer id,
                                                                 @Valid @RequestBody InterventionUrgenceRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<InterventionUrgenceResponseDto> changerStatut(
            @PathVariable Integer id,
            @RequestParam StatutInterventionUrgence statut) {
        return ResponseEntity.ok(service.changerStatut(id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
