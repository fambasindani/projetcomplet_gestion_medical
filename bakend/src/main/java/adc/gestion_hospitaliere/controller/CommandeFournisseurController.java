package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.StatutCommandeFournisseur;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.commande.CommandeFournisseurRequestDto;
import adc.gestion_hospitaliere.dto.commande.CommandeFournisseurResponseDto;
import adc.gestion_hospitaliere.service.CommandeFournisseurService;
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
@RequestMapping("/api/commandes-fournisseurs")
@RequiredArgsConstructor
public class CommandeFournisseurController {

    private final CommandeFournisseurService service;

    @GetMapping
    public ResponseEntity<PagedResponse<CommandeFournisseurResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.getAll(pageable)));
    }

    @GetMapping("/search")
    public ResponseEntity<PagedResponse<CommandeFournisseurResponseDto>> search(
            @RequestParam(required = false) StatutCommandeFournisseur statut,
            @RequestParam(required = false) Integer idFournisseur,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateStart,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateEnd,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        return ResponseEntity.ok(PagedResponse.of(service.search(statut, idFournisseur, dateStart, dateEnd, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CommandeFournisseurResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PostMapping
    public ResponseEntity<CommandeFournisseurResponseDto> create(@Valid @RequestBody CommandeFournisseurRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CommandeFournisseurResponseDto> update(@PathVariable Integer id, @Valid @RequestBody CommandeFournisseurRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}