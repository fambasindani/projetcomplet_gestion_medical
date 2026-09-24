package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Enums.GraviteUrgence;
import adc.gestion_hospitaliere.Enums.StatutAdmissionUrgence;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.urgence.AdmissionUrgenceRequestDto;
import adc.gestion_hospitaliere.dto.urgence.AdmissionUrgenceResponseDto;
import adc.gestion_hospitaliere.service.AdmissionUrgenceService;
import adc.gestion_hospitaliere.service.CurrentUserService;
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
@RequestMapping("/api/urgences/admissions")
@RequiredArgsConstructor
public class AdmissionUrgenceController {

    private final AdmissionUrgenceService service;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<PagedResponse<AdmissionUrgenceResponseDto>> getAll(
            @RequestParam(required = false) StatutAdmissionUrgence statut,
            @RequestParam(required = false) GraviteUrgence gravite,
            @RequestParam(required = false) Integer idPatient,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEnd,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        // Un médecin ne voit que les admissions dont il est le médecin.
        Integer force = currentUserService.filtreMedecinId();
        return ResponseEntity.ok(PagedResponse.of(service.search(statut, gravite, idPatient, force, dateStart, dateEnd, pageable)));
    }

    @GetMapping("/salle-attente")
    public ResponseEntity<List<AdmissionUrgenceResponseDto>> getSalleAttente() {
        return ResponseEntity.ok(service.getSalleAttente());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdmissionUrgenceResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<AdmissionUrgenceResponseDto> create(@Valid @RequestBody AdmissionUrgenceRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdmissionUrgenceResponseDto> update(@PathVariable Integer id,
                                                              @Valid @RequestBody AdmissionUrgenceRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<AdmissionUrgenceResponseDto> changerStatut(
            @PathVariable Integer id,
            @RequestParam StatutAdmissionUrgence statut) {
        return ResponseEntity.ok(service.changerStatut(id, statut));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
