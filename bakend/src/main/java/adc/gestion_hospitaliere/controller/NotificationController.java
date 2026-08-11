package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.notification.NotificationRequestDto;
import adc.gestion_hospitaliere.dto.notification.NotificationResponseDto;
import adc.gestion_hospitaliere.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<PagedResponse<NotificationResponseDto>> getAll(
            @RequestParam(required = false) Boolean lue,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<NotificationResponseDto> page = notificationService.getAll(lue, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/non-lues")
    public ResponseEntity<PagedResponse<NotificationResponseDto>> getNonLues(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(pageIndex - 1, pageSize);
        Page<NotificationResponseDto> page = notificationService.getNonLues(pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @GetMapping("/count-non-lues")
    public ResponseEntity<Map<String, Long>> countNonLues() {
        return ResponseEntity.ok(Map.of("count", notificationService.countNonLues()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDto> getById(@PathVariable Integer id) {
        return ResponseEntity.ok(notificationService.getById(id));
    }

    @PostMapping
    public ResponseEntity<NotificationResponseDto> create(@Valid @RequestBody NotificationRequestDto dto) {
        return ResponseEntity.ok(notificationService.create(dto));
    }

    @PatchMapping("/{id}/lue")
    public ResponseEntity<NotificationResponseDto> marquerLue(@PathVariable Integer id) {
        return ResponseEntity.ok(notificationService.marquerLue(id));
    }

    @PatchMapping("/lire-toutes")
    public ResponseEntity<Map<String, Long>> marquerToutesLues() {
        long nb = notificationService.marquerToutesLues();
        return ResponseEntity.ok(Map.of("updated", nb));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Integer id) {
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
