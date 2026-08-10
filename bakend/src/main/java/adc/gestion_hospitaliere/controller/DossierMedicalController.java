package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.dto.dosiier_medical.DossierMedicalDTO;
import adc.gestion_hospitaliere.service.DossierMedicalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

// controller/DossierMedicalController.java
@RestController
@RequestMapping("/api/patients/{patientId}/dossier-medical")
@RequiredArgsConstructor
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;

    @GetMapping
    public ResponseEntity<DossierMedicalDTO> getDossier(@PathVariable Integer patientId) {
        return ResponseEntity.ok(dossierMedicalService.getDossierMedical(patientId));
    }
}