package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.dto.ResponseApi.PagedResponse;
import adc.gestion_hospitaliere.dto.auth.UserCreateDto;
import adc.gestion_hospitaliere.dto.auth.UserResponseDto;
import adc.gestion_hospitaliere.dto.auth.UserUpdateDto;
import adc.gestion_hospitaliere.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('UTILISATEURS_GERER')")
public class AdminUserController {

    private final AuthService authService;

    // Liste paginée
    @GetMapping
    public ResponseEntity<PagedResponse<UserResponseDto>> getAllUsers(
            @RequestParam(required = false) String term,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Boolean actif,
            @RequestParam(defaultValue = "1") int pageIndex,
            @RequestParam(defaultValue = "10") int pageSize) {
        Pageable pageable = PageRequest.of(Math.max(pageIndex - 1, 0), pageSize);
        Page<UserResponseDto> pageResult = authService.searchUsers(term, role, actif, pageable).map(this::toDto);
        return ResponseEntity.ok(PagedResponse.of(pageResult));
    }

    // Détail d'un utilisateur
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        User user = authService.getUserById(id);
        return ResponseEntity.ok(toDto(user));
    }

    // Création d'un utilisateur (à partir d'un personnel)
    @PostMapping
    public ResponseEntity<UserResponseDto> createUser(@Valid @RequestBody UserCreateDto dto) {
        User user = authService.createUser(dto);
        return ResponseEntity.ok(toDto(user));
    }

    // Mise à jour (déjà présent)
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDto> updateUser(@PathVariable Long id, @Valid @RequestBody UserUpdateDto dto) {
        if (!id.equals(dto.getId())) {
            throw new BusinessException("L'ID du path ne correspond pas à l'ID du body");
        }
        User user = authService.updateUser(id, dto);
        return ResponseEntity.ok(toDto(user));
    }

    // Suppression
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        authService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    private UserResponseDto toDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .actif(user.isEnabled())
                .personnelId(user.getPersonnel() != null ? user.getPersonnel().getIdPersonnel() : null)
                .dateCreation(user.getDateCreation())
                .dateModification(user.getDateModification())
                .build();
    }
}