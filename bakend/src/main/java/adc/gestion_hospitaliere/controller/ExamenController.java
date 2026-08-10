package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.StatutExamen;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.examen.ExamenRequestDto;
import adc.gestion_hospitaliere.dto.examen.ExamenResponseDto;
import adc.gestion_hospitaliere.dto.examen.ExamensBatchRequest;
import adc.gestion_hospitaliere.service.ExamenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/examens")
@RequiredArgsConstructor
public class ExamenController {

    private final ExamenService service;

    // ---------- CRUD ----------

    // GET /api/examens?page=1&size=10
    @GetMapping
    public ResponseEntity<PagedResponse<ExamenResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ExamenResponseDto> page = service.getAll(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    // GET /api/examens/{id}
    @GetMapping("/{id}")
    public ResponseEntity<ExamenResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // POST /api/examens
    @PostMapping
    public ResponseEntity<ExamenResponseDto> create(@Valid @RequestBody ExamenRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // PUT /api/examens/{id}
    @PutMapping("/{id}")
    public ResponseEntity<ExamenResponseDto> update(
            @PathVariable Integer id,
            @Valid @RequestBody ExamenRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE /api/examens/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- Endpoints pour l'impression (fournissent les données) ----------

    // GET /api/examens/patient/{patientId}
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ExamenResponseDto>> getByPatient(@PathVariable Integer patientId) {
        return ResponseEntity.ok(service.getExamensByPatient(patientId));
    }

    // GET /api/examens/medecin/{medecinId}
    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<List<ExamenResponseDto>> getByMedecin(@PathVariable Integer medecinId) {
        return ResponseEntity.ok(service.getExamensByMedecin(medecinId));
    }

    @PostMapping("/batch")
    public ResponseEntity<List<ExamenResponseDto>> createBatch(@Valid @RequestBody ExamensBatchRequest request) {
        List<ExamenResponseDto> results = new ArrayList<>();
        for (ExamenRequestDto dto : request.getExamens()) {
            results.add(service.create(dto));   // ← correction ici
        }
        return ResponseEntity.ok(results);
    }

    // GET /api/examens/prescription/{prescriptionId}
    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<ExamenResponseDto>> getByPrescription(@PathVariable Integer prescriptionId) {
        return ResponseEntity.ok(service.getExamensByPrescription(prescriptionId));
    }

    // GET /api/examens/statut/{statut}
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<ExamenResponseDto>> getByStatut(@PathVariable StatutExamen statut) {
        return ResponseEntity.ok(service.getExamensByStatut(statut));
    }
}