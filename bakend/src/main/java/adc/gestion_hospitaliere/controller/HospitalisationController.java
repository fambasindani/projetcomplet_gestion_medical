package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Enums.StatutHospitalisation;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.hospitalisation.HospitalisationRequestDto;
import adc.gestion_hospitaliere.dto.hospitalisation.HospitalisationResponseDto;
import adc.gestion_hospitaliere.service.CurrentUserService;
import adc.gestion_hospitaliere.service.HospitalisationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/hospitalisations")
@RequiredArgsConstructor
public class HospitalisationController {

    private final HospitalisationService service;
    private final CurrentUserService currentUserService;

    @GetMapping
    public ResponseEntity<PagedResponse<HospitalisationResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        // Un médecin ne voit que les hospitalisations dont il est responsable.
        Integer filtreMedecin = currentUserService.filtreMedecinId();
        if (filtreMedecin != null) {
            return ResponseEntity.ok(PagedResponse.of(service.getAllForMedecin(filtreMedecin, pageable)));
        }
        // Un infirmier ne voit que les hospitalisations de son service.
        Integer filtreService = currentUserService.filtreServiceInfirmierId();
        if (filtreService != null) {
            if (filtreService == -1) {
                return ResponseEntity.ok(PagedResponse.of(Page.empty(pageable)));
            }
            return ResponseEntity.ok(PagedResponse.of(service.getAllForService(filtreService, pageable)));
        }
        return ResponseEntity.ok(PagedResponse.of(service.getAll(pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<HospitalisationResponseDto>> search(
            @RequestParam(required = false) StatutHospitalisation statut,
            @RequestParam(required = false) Integer idPatient,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEnd,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Integer filtreService = currentUserService.filtreServiceInfirmierId();
        if (filtreService != null) {
            if (filtreService == -1) {
                return ResponseEntity.ok(PagedResponse.of(Page.empty(pageable)));
            }
            return ResponseEntity.ok(PagedResponse.of(
                    service.searchForService(statut, idPatient, dateStart, dateEnd, filtreService, pageable)));
        }
        return ResponseEntity.ok(PagedResponse.of(service.search(statut, idPatient, dateStart, dateEnd, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalisationResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PatchMapping("/{id}/statut")
    public ResponseEntity<HospitalisationResponseDto> changerStatut(
            @PathVariable Integer id,
            @RequestParam StatutHospitalisation statut) {
        return ResponseEntity.ok(service.changerStatut(id, statut));
    }



    @PostMapping
    public ResponseEntity<HospitalisationResponseDto> create(@Valid @RequestBody HospitalisationRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<HospitalisationResponseDto> update(@PathVariable Integer id, @Valid @RequestBody HospitalisationRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
