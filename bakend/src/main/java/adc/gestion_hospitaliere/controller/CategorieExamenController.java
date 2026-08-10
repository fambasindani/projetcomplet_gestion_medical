package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.categorieExamen.CategorieExamenRequestDto;
import adc.gestion_hospitaliere.dto.categorieExamen.CategorieExamenResponseDto;
import adc.gestion_hospitaliere.service.CategorieExamenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories-examen")
@RequiredArgsConstructor
public class CategorieExamenController {

    private final CategorieExamenService service;

    // GET /api/categories-examen?page=1&size=10
    @GetMapping
    public ResponseEntity<PagedResponse<CategorieExamenResponseDto>> getAll(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<CategorieExamenResponseDto> page = service.getAll(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    // GET /api/categories-examen/all
    @GetMapping("/all")
    public ResponseEntity<List<CategorieExamenResponseDto>> getAllList() {
        return ResponseEntity.ok(service.getAllList());
    }

    // GET /api/categories-examen/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CategorieExamenResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(service.getById(id));
    }

    // POST /api/categories-examen
    @PostMapping
    public ResponseEntity<CategorieExamenResponseDto> create(@Valid @RequestBody CategorieExamenRequestDto dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    // PUT /api/categories-examen/{id}
    @PutMapping("/{id}")
    public ResponseEntity<CategorieExamenResponseDto> update(
            @PathVariable Integer id,
            @Valid @RequestBody CategorieExamenRequestDto dto) {
        return ResponseEntity.ok(service.update(id, dto));
    }

    // DELETE /api/categories-examen/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}