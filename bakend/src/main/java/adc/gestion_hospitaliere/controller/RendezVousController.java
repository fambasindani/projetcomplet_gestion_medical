package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.rendezvous.RendezVousRequestDto;
import adc.gestion_hospitaliere.dto.rendezvous.RendezVousResponseDto;
import adc.gestion_hospitaliere.service.CurrentUserService;
import adc.gestion_hospitaliere.service.RendezVousService;
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
import java.util.Map;

@RestController
@RequestMapping("/api/rendezvous")
@RequiredArgsConstructor
public class RendezVousController {
    private final RendezVousService rendezVousService;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<PagedResponse<RendezVousResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        // Un médecin ne voit que ses propres rendez-vous (rien s'il n'est pas rattaché) ; les autres voient tout.
        Integer filtre = currentUserService.filtreMedecinId();
        Page<RendezVousResponseDto> page = (filtre != null)
                ? rendezVousService.search(null, null, null, filtre, null, pageable)
                : rendezVousService.getAll(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<Void> changerStatut(@PathVariable Integer id, @RequestParam String statut) {
        rendezVousService.changerStatut(id, StatutRendezVous.valueOf(statut));
        return ResponseEntity.ok().build();
    }


    @GetMapping("/stats/aujourdhui")
    public ResponseEntity<Map<String, Long>> getAujourdhui(@RequestParam(required = false) Integer idMedecin) {
        // Un médecin ne compte que ses rendez-vous.
        Integer force = currentUserService.filtreMedecinId();
        long count = rendezVousService.compterAujourdhui(force != null ? force : idMedecin);
        return ResponseEntity.ok(Map.of("aujourdhui", count));
    }

    // RendezVousController.java
    @GetMapping("/search")
    public ResponseEntity<PagedResponse<RendezVousResponseDto>> search(
            @RequestParam(required = false) StatutRendezVous statut,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) Integer idMedecin,
            @RequestParam(required = false) Integer idPatient,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        // Force le filtre sur le médecin connecté.
        Integer force = currentUserService.filtreMedecinId();
        Page<RendezVousResponseDto> page = rendezVousService.search(
                statut, start, end, force != null ? force : idMedecin, idPatient, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PagedResponse<RendezVousResponseDto>> getByPatient(
            @PathVariable Integer patientId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<RendezVousResponseDto> page = rendezVousService.getByPatient(patientId, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<PagedResponse<RendezVousResponseDto>> getByMedecin(
            @PathVariable Integer medecinId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<RendezVousResponseDto> page = rendezVousService.getByMedecin(medecinId, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/statut/{statut}")
    public ResponseEntity<PagedResponse<RendezVousResponseDto>> getByStatut(
            @PathVariable StatutRendezVous statut,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<RendezVousResponseDto> page = rendezVousService.getByStatut(statut, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<RendezVousResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(rendezVousService.getById(id));
    }

    @PostMapping
    public ResponseEntity<RendezVousResponseDto> create(@Valid @RequestBody RendezVousRequestDto dto) {
        return ResponseEntity.ok(rendezVousService.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<RendezVousResponseDto> update(@PathVariable Integer id, @Valid @RequestBody RendezVousRequestDto dto) {
        return ResponseEntity.ok(rendezVousService.update(id, dto));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(@PathVariable Integer id, @RequestParam String motif) {
        rendezVousService.annuler(id, motif);
        return ResponseEntity.ok().build();
    }
    @GetMapping("/planning/journalier")
    public ResponseEntity<List<RendezVousResponseDto>> getPlanningJournalier(
            @RequestParam LocalDateTime date,
            @RequestParam(required = false) Integer idMedecin) {
        Integer force = currentUserService.filtreMedecinId();
        return ResponseEntity.ok(rendezVousService.getPlanningJournalier(date, force != null ? force : idMedecin));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        rendezVousService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
