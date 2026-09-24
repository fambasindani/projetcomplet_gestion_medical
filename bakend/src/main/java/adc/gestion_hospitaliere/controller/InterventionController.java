package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.intervention.InterventionResponseDto;
import adc.gestion_hospitaliere.service.InterventionService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/interventions")
@RequiredArgsConstructor
public class InterventionController {

    private final InterventionService interventionService;

    @GetMapping("/{id}")
    public ResponseEntity<InterventionResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(interventionService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<PagedResponse<InterventionResponseDto>> getByPatient(
            @PathVariable Integer patientId,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "20") int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(pageIndex - 1, 0), pageSize);
        Page<InterventionResponseDto> page = interventionService.getByPatient(patientId, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }
}
