package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.consultation.ConsultationRequestDto;
import adc.gestion_hospitaliere.dto.consultation.ConsultationResponseDto;
import adc.gestion_hospitaliere.service.ConsultationService;
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
@RequestMapping("/api/consultations")
@RequiredArgsConstructor
public class ConsultationController {

    private final ConsultationService consultationService;

    @GetMapping
    public ResponseEntity<PagedResponse<ConsultationResponseDto>> getAllConsultations(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ConsultationResponseDto> page = consultationService.getAllConsultations(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PagedResponse<ConsultationResponseDto>> getConsultationsByPatient(
            @PathVariable Integer patientId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ConsultationResponseDto> page = consultationService.getConsultationsByPatient(patientId, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/medecin/{medecinId}")
    public ResponseEntity<PagedResponse<ConsultationResponseDto>> getConsultationsByMedecin(
            @PathVariable Integer medecinId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<ConsultationResponseDto> page = consultationService.getConsultationsByMedecin(medecinId, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConsultationResponseDto> getConsultation(@PathVariable Integer id) {
        return ResponseEntity.ok(consultationService.getConsultation(id));
    }

    @PostMapping
    public ResponseEntity<ConsultationResponseDto> createConsultation(@Valid @RequestBody ConsultationRequestDto dto) {
        ConsultationResponseDto created = consultationService.createConsultation(dto);
        return ResponseEntity.created(URI.create("/api/consultations/" + created.getIdConsultation())).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConsultationResponseDto> updateConsultation(@PathVariable Integer id,
                                                                      @Valid @RequestBody ConsultationRequestDto dto) {
        ConsultationResponseDto updated = consultationService.updateConsultation(id, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConsultation(@PathVariable Integer id) {
        consultationService.deleteConsultation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistiques")
    public ResponseEntity<Map<String, Object>> getStatistiques() {
        return ResponseEntity.ok(consultationService.getStatistiques());
    }
}