package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Enums.Genre;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.patient.*;
import adc.gestion_hospitaliere.service.PatientService;
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
@RequestMapping("/api/patient")
@RequiredArgsConstructor
public class PatientController {

    private final PatientService patientService;

    @GetMapping
    public ResponseEntity<PagedResponse<PatientResponseDto>> getAllPatients(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<PatientResponseDto> page = patientService.getAllPatients(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientResponseDto> getPatient(@PathVariable Integer id) {
        return ResponseEntity.ok(patientService.getPatientById(id));
    }

    @PostMapping
    public ResponseEntity<PatientResponseDto> createPatient(@Valid @RequestBody PatientRequestDto dto) {
        PatientResponseDto created = patientService.createPatient(dto);
        return ResponseEntity.created(URI.create("/api/patients/" + created.getIdPatient())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientResponseDto> updatePatient(@PathVariable Integer id,
                                                            @Valid @RequestBody PatientUpdateDto dto) {
        PatientResponseDto updated = patientService.updatePatient(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePatient(@PathVariable Integer id) {
        patientService.deletePatient(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/recherche")
    public ResponseEntity<PagedResponse<PatientResponseDto>> searchPatients(
            @RequestParam String term,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<PatientResponseDto> page = patientService.searchPatients(term, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<PagedResponse<PatientResponseDto>> getPatientsByGenre(
            @PathVariable Genre genre,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<PatientResponseDto> page = patientService.getPatientsByGenre(genre, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(patientService.getStatistiques());
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Map<String, Object>> getPatientDetails(@PathVariable Integer id) {
        return ResponseEntity.ok(patientService.getPatientDetails(id));
    }
}