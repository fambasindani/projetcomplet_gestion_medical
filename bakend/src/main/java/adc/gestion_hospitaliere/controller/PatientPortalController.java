package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.service.PatientPortalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Portail patient : routes accessibles au rôle PATIENT (et à l'admin).
 * Aucun idPatient n'est accepté en paramètre : il est toujours déduit
 * du compte connecté, ce qui empêche tout accès au dossier d'un autre patient.
 */
@RestController
@RequestMapping("/api/patient-portail")
@RequiredArgsConstructor
public class PatientPortalController {

    private final PatientPortalService service;

    @GetMapping("/dossier")
    @PreAuthorize("hasAuthority('MON_DOSSIER_VOIR')")
    public ResponseEntity<Map<String, Object>> getDossier() {
        return ResponseEntity.ok(service.getDossier());
    }

    @GetMapping("/medecins")
    @PreAuthorize("hasAuthority('MES_RENDEZ_VOUS_VOIR')")
    public ResponseEntity<List<Map<String, Object>>> getMedecinsDisponibles() {
        return ResponseEntity.ok(service.getMedecinsDisponibles());
    }

    @GetMapping("/rendez-vous")
    @PreAuthorize("hasAuthority('MES_RENDEZ_VOUS_VOIR')")
    public ResponseEntity<List<Map<String, Object>>> getMesRendezVous() {
        return ResponseEntity.ok(service.getMesRendezVous());
    }

    @PostMapping("/rendez-vous")
    @PreAuthorize("hasAuthority('MES_RENDEZ_VOUS_DEMANDER')")
    public ResponseEntity<Map<String, Object>> demanderRendezVous(@RequestBody DemandeRdvRequest request) {
        return ResponseEntity.ok(
                service.demanderRendezVous(request.dateRdv, request.idMedecin, request.motif));
    }

    @PatchMapping("/rendez-vous/{id}/annuler")
    @PreAuthorize("hasAuthority('MES_RENDEZ_VOUS_ANNULER')")
    public ResponseEntity<Map<String, Object>> annulerRendezVous(@PathVariable Integer id) {
        return ResponseEntity.ok(service.annulerRendezVous(id));
    }

    @GetMapping("/examens")
    @PreAuthorize("hasAuthority('MES_EXAMENS_VOIR')")
    public ResponseEntity<List<Map<String, Object>>> getMesExamens() {
        return ResponseEntity.ok(service.getMesExamens());
    }

    @GetMapping("/ordonnances")
    @PreAuthorize("hasAuthority('MES_ORDONNANCES_VOIR')")
    public ResponseEntity<List<Map<String, Object>>> getMesOrdonnances() {
        return ResponseEntity.ok(service.getMesOrdonnances());
    }

    @GetMapping("/consultations")
    @PreAuthorize("hasAuthority('MES_ORDONNANCES_VOIR')")
    public ResponseEntity<List<Map<String, Object>>> getMesConsultations() {
        return ResponseEntity.ok(service.getMesConsultations());
    }

    @GetMapping("/factures")
    @PreAuthorize("hasAuthority('MES_FACTURES_VOIR')")
    public ResponseEntity<List<Map<String, Object>>> getMesFactures() {
        return ResponseEntity.ok(service.getMesFactures());
    }

    public static class DemandeRdvRequest {
        public LocalDateTime dateRdv;
        public Integer idMedecin;
        public String motif;
    }
}
