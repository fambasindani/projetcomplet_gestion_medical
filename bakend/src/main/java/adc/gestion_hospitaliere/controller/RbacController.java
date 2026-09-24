package adc.gestion_hospitaliere.controller;

import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.rbac.PermissionDto;
import adc.gestion_hospitaliere.dto.rbac.RoleDto;
import adc.gestion_hospitaliere.service.RbacService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/api/admin/rbac")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('UTILISATEURS_GERER')")
public class RbacController {

    private final RbacService rbacService;

    // ---------- RÔLES ----------

    @GetMapping("/roles")
    public ResponseEntity<PagedResponse<RoleDto>> listerRoles(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(pageIndex - 1, 0), pageSize, Sort.by("nom").ascending());
        return ResponseEntity.ok(PagedResponse.of(rbacService.listerRoles(pageable)));
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<RoleDto> getRole(@PathVariable Long id) {
        return ResponseEntity.ok(rbacService.getRole(id));
    }

    @PostMapping("/roles")
    public ResponseEntity<RoleDto> creerRole(@RequestBody RoleRequest request) {
        return ResponseEntity.ok(rbacService.creerRole(request.getNom(), request.getDescription()));
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<RoleDto> modifierRole(@PathVariable Long id, @RequestBody RoleRequest request) {
        return ResponseEntity.ok(rbacService.modifierRole(id, request.getNom(), request.getDescription()));
    }

    @DeleteMapping("/roles/{id}")
    public ResponseEntity<Void> supprimerRole(@PathVariable Long id) {
        rbacService.supprimerRole(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/roles/{nomRole}/permissions")
    public ResponseEntity<Void> affecterPermissions(@PathVariable String nomRole,
                                                    @RequestBody PermissionsRequest request) {
        rbacService.affecterPermissionsAuRole(nomRole, request.getPermissions());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/roles/{nomRole}/permissions/{permission}")
    public ResponseEntity<Void> ajouterPermission(@PathVariable String nomRole,
                                                  @PathVariable String permission) {
        rbacService.ajouterPermissionAuRole(nomRole, permission);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/roles/{nomRole}/permissions/{permission}")
    public ResponseEntity<Void> retirerPermission(@PathVariable String nomRole,
                                                  @PathVariable String permission) {
        rbacService.retirerPermissionDuRole(nomRole, permission);
        return ResponseEntity.noContent().build();
    }

    // ---------- PERMISSIONS ----------

    @GetMapping("/permissions")
    public ResponseEntity<PagedResponse<PermissionDto>> listerPermissions(
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(pageIndex - 1, 0), pageSize, Sort.by("module").ascending().and(Sort.by("code").ascending()));
        return ResponseEntity.ok(PagedResponse.of(rbacService.listerPermissions(pageable)));
    }

    @PostMapping("/permissions")
    public ResponseEntity<PermissionDto> creerPermission(@RequestBody PermissionRequest request) {
        return ResponseEntity.ok(rbacService.creerPermission(request.getCode(), request.getLibelle(), request.getModule()));
    }

    @PutMapping("/permissions/{id}")
    public ResponseEntity<PermissionDto> modifierPermission(@PathVariable Long id, @RequestBody PermissionRequest request) {
        return ResponseEntity.ok(rbacService.modifierPermission(id, request.getLibelle(), request.getModule()));
    }

    @DeleteMapping("/permissions/{id}")
    public ResponseEntity<Void> supprimerPermission(@PathVariable Long id) {
        rbacService.supprimerPermission(id);
        return ResponseEntity.noContent().build();
    }

    // ---------- UTILISATEURS ----------

    @GetMapping("/utilisateurs/{idUtilisateur}/roles")
    public ResponseEntity<Set<String>> listerRolesUtilisateur(@PathVariable Long idUtilisateur) {
        return ResponseEntity.ok(rbacService.rolesDeUtilisateur(idUtilisateur));
    }

    @PutMapping("/utilisateurs/{idUtilisateur}/roles")
    public ResponseEntity<Void> affecterRoles(@PathVariable Long idUtilisateur,
                                              @RequestBody RolesRequest request) {
        rbacService.affecterRolesAUtilisateur(idUtilisateur, request.getRoles());
        return ResponseEntity.noContent().build();
    }

    // ---------- DTOs ----------

    @Data
    public static class RoleRequest {
        private String nom;
        private String description;
    }

    @Data
    public static class PermissionRequest {
        private String code;
        private String libelle;
        private String module;
    }

    @Data
    public static class PermissionsRequest {
        private Set<String> permissions;
    }

    @Data
    public static class RolesRequest {
        private Set<String> roles;
    }
}
