package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.StatutPrescription;
import adc.gestion_hospitaliere.Enums.TypePrescription;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.prescription.PrescriptionMedicamentResponseDto;
import adc.gestion_hospitaliere.dto.prescription.PrescriptionRequestDto;
import adc.gestion_hospitaliere.dto.prescription.PrescriptionResponseDto;
import adc.gestion_hospitaliere.service.PrescriptionService;
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
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService service;

    @GetMapping
    public ResponseEntity<PagedResponse<PrescriptionResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.getAll(pageable)));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<PagedResponse<PrescriptionResponseDto>> getByType(
            @PathVariable TypePrescription type,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.getByType(type, pageable)));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PagedResponse<PrescriptionResponseDto>> getByPatient(
            @PathVariable Integer patientId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.getByPatient(patientId, pageable)));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<PagedResponse<PrescriptionResponseDto>> getByMedecin(
            @PathVariable Integer medecinId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.getByMedecin(medecinId, pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<PrescriptionResponseDto>> search(
            @RequestParam(required = false) TypePrescription type,
            @RequestParam(required = false) StatutPrescription statut,
            @RequestParam(required = false) Integer idPatient,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEnd,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.search(type, statut, idPatient, dateStart, dateEnd, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @GetMapping("/{id}/medicaments")
    public ResponseEntity<List<PrescriptionMedicamentResponseDto>> getMedicamentsByPrescription(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getMedicamentsByPrescription(id));
    }

    @PostMapping
    public ResponseEntity<PrescriptionResponseDto> create(@Valid @RequestBody PrescriptionRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionResponseDto> update(@PathVariable Integer id, @Valid @RequestBody PrescriptionRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @PatchMapping("/{id}/annuler")
    public ResponseEntity<Void> annuler(@PathVariable Integer id, @RequestParam String motif) {
        service.annuler(id, motif);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}