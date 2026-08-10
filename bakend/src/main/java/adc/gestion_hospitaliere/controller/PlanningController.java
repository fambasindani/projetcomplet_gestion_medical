package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.UserRepository;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.planning.RendezVousResponseDto;
import adc.gestion_hospitaliere.exception.BusinessException;
import adc.gestion_hospitaliere.service.PlanningService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;
    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;

    // Récupère le médecin associé à l'utilisateur authentifié.
    // Retourne null pour ADMIN/SECRETAIRE (qui voient alors tous les rendez-vous).
    private Integer getCurrentMedecinId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return null;
        }
        Object principal = auth.getPrincipal();
        String email = null;
        if (principal instanceof User user) {
            email = user.getEmail();
        } else if (principal instanceof String s) {
            email = s;
        }
        if (email == null) {
            return null;
        }
        return userRepository.findByEmail(email)
                .filter(u -> u.getRole() == Role.MEDECIN)
                .map(u -> medecinRepository.findByEmail(u.getEmail()))
                .filter(java.util.Optional::isPresent)
                .map(java.util.Optional::get)
                .map(Medecin::getIdMedecin)
                .orElse(null);
    }

    @GetMapping("/rendezvous")
    public ResponseEntity<PagedResponse<RendezVousResponseDto>> getRendezVous(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime end,
            @RequestParam(required = false) StatutRendezVous statut,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {

        Integer medecinId = getCurrentMedecinId();
        Pageable pageable = PageRequest.of(Math.max(pageIndex - 1, 0), pageSize);
        Page<RendezVousResponseDto> page = planningService.getRendezVousByMedecin(medecinId, start, end, statut, pageable);
        return ResponseEntity.ok(PagedResponse.of(page));
    }

    @PatchMapping("/rendezvous/{id}/statut")
    public ResponseEntity<Void> updateStatut(@PathVariable Integer id, @RequestBody Map<String, String> payload) {
        String nouveauStatut = payload.get("statut");
        if (nouveauStatut == null) {
            throw new BusinessException("Le statut est requis");
        }
        StatutRendezVous statut;
        try {
            statut = StatutRendezVous.valueOf(nouveauStatut);
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Statut invalide : " + nouveauStatut);
        }
        planningService.updateStatut(id, statut);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Integer medecinId = getCurrentMedecinId();
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0);
        LocalDateTime endOfDay = now.withHour(23).withMinute(59).withSecond(59);
        long rdvAujourdhui = planningService.countByMedecinAndDateBetween(medecinId, startOfDay, endOfDay);
        Map<String, Object> stats = new HashMap<>();
        stats.put("aujourdhui", rdvAujourdhui);
        return ResponseEntity.ok(stats);
    }
}
