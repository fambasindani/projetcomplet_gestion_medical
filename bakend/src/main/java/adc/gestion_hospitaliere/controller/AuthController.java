package adc.gestion_hospitaliere.controller;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Repository.UserRepository;
import adc.gestion_hospitaliere.dto.ResponseApi.ApiResponse;
import adc.gestion_hospitaliere.dto.auth.AuthResponse;
import adc.gestion_hospitaliere.dto.auth.LoginRequest;
import adc.gestion_hospitaliere.dto.auth.RegisterRequest;
import adc.gestion_hospitaliere.dto.auth.UserResponseDto;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor

public class AuthController {
    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .message("Inscription réussie")
                .data(response).build());
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.<AuthResponse>builder()
                .message("Connexion réussie")
                .data(response).build());
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponseDto>> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new ResourceNotFoundException("Utilisateur non connecté");
        }
        Object principal = auth.getPrincipal();
        String email = principal instanceof User u ? u.getEmail() : principal.toString();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        UserResponseDto dto = UserResponseDto.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole())
                .actif(user.isEnabled())
                .personnelId(user.getPersonnel() != null ? user.getPersonnel().getIdPersonnel() : null)
                .build();
        return ResponseEntity.ok(ApiResponse.<UserResponseDto>builder()
                .message("Utilisateur connecté")
                .data(dto).build());
    }
}