package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.Enums.CategorieActeMedical;
import adc.gestion_hospitaliere.dto.catalogue.ActeCatalogueRequestDto;
import adc.gestion_hospitaliere.dto.catalogue.ActeCatalogueResponseDto;
import adc.gestion_hospitaliere.dto.catalogue.GroupeActeRequestDto;
import adc.gestion_hospitaliere.dto.catalogue.GroupeActeResponseDto;
import adc.gestion_hospitaliere.service.ActeCatalogueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/actes-catalogue")
@RequiredArgsConstructor
public class ActeCatalogueController {

    private final ActeCatalogueService catalogueService;

    // ===== LECTURE (autocomplete : actes actifs) =====

    @GetMapping("/groupes")
    public ResponseEntity<List<GroupeActeResponseDto>> getGroupes(
            @RequestParam(required = false) CategorieActeMedical categorie) {
        if (categorie == null) {
            return ResponseEntity.ok(List.of());
        }
        return ResponseEntity.ok(catalogueService.getGroupes(categorie));
    }

    @GetMapping
    public ResponseEntity<List<ActeCatalogueResponseDto>> search(
            @RequestParam(required = false) CategorieActeMedical categorie,
            @RequestParam(required = false) Integer idGroupe,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogueService.search(categorie, idGroupe, search));
    }

    // ===== ADMIN (inclut les inactifs) =====

    @GetMapping("/admin")
    public ResponseEntity<List<ActeCatalogueResponseDto>> searchAdmin(
            @RequestParam(required = false) CategorieActeMedical categorie,
            @RequestParam(required = false) Integer idGroupe,
            @RequestParam(required = false) String search) {
        return ResponseEntity.ok(catalogueService.searchAdmin(categorie, idGroupe, search));
    }

    @GetMapping("/groupes/admin")
    public ResponseEntity<List<GroupeActeResponseDto>> listerGroupes(
            @RequestParam(required = false) CategorieActeMedical categorie) {
        return ResponseEntity.ok(catalogueService.listerGroupes(categorie));
    }

    // ===== CRUD ACTES =====

    @PostMapping
    public ResponseEntity<ActeCatalogueResponseDto> createActe(@Valid @RequestBody ActeCatalogueRequestDto dto) {
        return ResponseEntity.ok(catalogueService.createActe(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ActeCatalogueResponseDto> updateActe(@PathVariable Integer id,
                                                               @Valid @RequestBody ActeCatalogueRequestDto dto) {
        return ResponseEntity.ok(catalogueService.updateActe(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActe(@PathVariable Integer id) {
        catalogueService.deleteActe(id);
        return ResponseEntity.noContent().build();
    }

    // ===== CRUD GROUPES =====

    @PostMapping("/groupes")
    public ResponseEntity<GroupeActeResponseDto> createGroupe(@Valid @RequestBody GroupeActeRequestDto dto) {
        return ResponseEntity.ok(catalogueService.createGroupe(dto));
    }

    @PutMapping("/groupes/{id}")
    public ResponseEntity<GroupeActeResponseDto> updateGroupe(@PathVariable Integer id,
                                                              @Valid @RequestBody GroupeActeRequestDto dto) {
        return ResponseEntity.ok(catalogueService.updateGroupe(id, dto));
    }

    @DeleteMapping("/groupes/{id}")
    public ResponseEntity<Void> deleteGroupe(@PathVariable Integer id) {
        catalogueService.deleteGroupe(id);
        return ResponseEntity.noContent().build();
    }
}
