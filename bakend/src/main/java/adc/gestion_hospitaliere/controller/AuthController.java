package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.UserRepository;
import adc.gestion_hospitaliere.dto.ResponseApi.ApiResponse;
import adc.gestion_hospitaliere.dto.auth.AuthResponse;
import adc.gestion_hospitaliere.dto.auth.ChangePasswordRequest;
import adc.gestion_hospitaliere.dto.auth.LoginRequest;
import adc.gestion_hospitaliere.dto.auth.RefreshTokenRequest;
import adc.gestion_hospitaliere.dto.auth.UserResponseDto;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.service.AuthService;
import adc.gestion_hospitaliere.service.RbacService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;
    private final RbacService rbacService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .message("Connexion réussie")
                .data(response).build());
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@Valid @RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .message("Token rafraîchi")
                .data(response).build());
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getName())) {
            throw new ResourceNotFoundException("Utilisateur non connecté");
        }
        authService.changerMotDePasse(auth.getName(), request);
        return ResponseEntity.ok(ApiResponse.<Void>builder()
                .message("Mot de passe modifié")
                .build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResourceNotFoundException("Utilisateur non connecté");
        }
        Object principal = auth.getPrincipal();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        List<String> permissions = new java.util.ArrayList<>(rbacService.permissionsDeUtilisateur(user.getId()));
        UserResponseDto dto = UserResponseDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .actif(user.isEnabled())
                .personnelId(user.getPersonnel() != null ? user.getPersonnel().getIdPersonnel() : null)
                .medecinId(user.getRole() == Role.MEDECIN
                        ? medecinRepository.findByEmail(user.getEmail()).map(Medecin::getIdMedecin).orElse(null)
                        : null)
                .permissions(permissions)
                .build();
        return ResponseEntity.ok(ApiResponse.<UserResponseDto>builder()
                .message("Utilisateur connecté")
                .data(dto).build());
    }
}