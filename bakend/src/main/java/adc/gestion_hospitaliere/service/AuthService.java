package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.Repository.UserRepository;
import adc.gestion_hospitaliere.dto.auth.AuthResponse;
import adc.gestion_hospitaliere.dto.auth.ChangePasswordRequest;
import adc.gestion_hospitaliere.dto.auth.LoginRequest;
import adc.gestion_hospitaliere.dto.auth.UserCreateDto;
import adc.gestion_hospitaliere.dto.auth.UserUpdateDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PersonnelRepository personnelRepository;
    private final MedecinRepository medecinRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RbacService rbacService;
    private final AuthenticationManager authenticationManager;

    @Value("${jwt.expiration}")
    private Long jwtExpiration;

    // ==================== ADMINISTRATION ====================

    public Page<User> getAllUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
    }

    @Transactional
    public User createUser(UserCreateDto dto) {
        // Vérifier que le personnel existe
        Personnel personnel = personnelRepository.findById(dto.getPersonnelId())
                .orElseThrow(() -> new ResourceNotFoundException("Personnel introuvable"));

        // Vérifier que l'email n'est pas déjà utilisé
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email déjà utilisé");
        }

        if (!dto.getPassword().equals(dto.getConfirmPassword())) {
            throw new BusinessException("Les mots de passe ne correspondent pas");
        }

        User user = User.builder()
                .nom(personnel.getNom())
                .prenom(personnel.getPrenom())
                .email(dto.getEmail())
                .password(passwordEncoder.encode(dto.getPassword()))
                .role(dto.getRole())
                .isActive(true)
                .personnel(personnel)
                .dateCreation(LocalDateTime.now())
                .dateModification(LocalDateTime.now())
                .build();

        User saved = userRepository.save(user);
        if (saved.getRole() != null) {
            rbacService.affecterRolesAUtilisateur(saved.getId(), Set.of(saved.getRole().name()));
        }
        return saved;
    }

    @Transactional
    public User updateUser(Long id, UserUpdateDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        // 1. Si l’email change, vérifier qu’il correspond à un personnel existant
        if (dto.getEmail() != null && !dto.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(dto.getEmail())) {
                throw new BusinessException("Cet email est déjà utilisé par un autre utilisateur");
            }
            Personnel personnel = personnelRepository.findByEmail(dto.getEmail())
                    .orElseThrow(() -> new ResourceNotFoundException("Aucun personnel trouvé avec cet email"));
            user.setEmail(dto.getEmail());
            user.setPersonnel(personnel);
            user.setNom(personnel.getNom());
            user.setPrenom(personnel.getPrenom());
        }

        // 2. Si changement de personnel (via personnelId) sans changer l’email
        if (dto.getPersonnelId() != null && dto.getPersonnelId() > 0) {
            Personnel personnel = personnelRepository.findById(dto.getPersonnelId())
                    .orElseThrow(() -> new ResourceNotFoundException("Personnel introuvable"));
            user.setPersonnel(personnel);
            user.setNom(personnel.getNom());
            user.setPrenom(personnel.getPrenom());
        }

        // 3. Mise à jour du rôle
        boolean roleChange = false;
        if (dto.getRole() != null && dto.getRole() != user.getRole()) {
            user.setRole(dto.getRole());
            roleChange = true;
        }

        // 4. Activation / désactivation
        if (dto.getIsActive() != null) {
            user.setActive(dto.getIsActive());
        }

        // 5. Changement de mot de passe
        if (dto.getPassword() != null && !dto.getPassword().isEmpty()) {
            if (!dto.getPassword().equals(dto.getConfirmPassword())) {
                throw new BusinessException("Les mots de passe ne correspondent pas");
            }
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        user.setDateModification(LocalDateTime.now());
        User saved = userRepository.save(user);
        if (roleChange && saved.getRole() != null) {
            rbacService.affecterRolesAUtilisateur(saved.getId(), Set.of(saved.getRole().name()));
        }
        return saved;
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur non trouvé");
        }
        rbacService.affecterRolesAUtilisateur(id, Set.of());
        userRepository.deleteById(id);
    }

    // ==================== AUTHENTIFICATION ====================

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        return buildAuthResponse(user, token, refreshToken);
    }

    public AuthResponse refreshToken(String refreshToken) {
        String email;
        try {
            email = jwtService.extractUsername(refreshToken);
        } catch (Exception e) {
            throw new BusinessException("Refresh token invalide ou expiré");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!user.isActive() || !jwtService.isRefreshTokenValid(refreshToken)) {
            throw new BusinessException("Refresh token invalide ou expiré");
        }

        String token = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        return buildAuthResponse(user, token, newRefreshToken);
    }

    @Transactional
    public void changerMotDePasse(String email, ChangePasswordRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur non trouvé"));

        if (!passwordEncoder.matches(request.getAncienMotDePasse(), user.getPassword())) {
            throw new BusinessException("Le mot de passe actuel est incorrect");
        }
        if (!request.getNouveauMotDePasse().equals(request.getConfirmationMotDePasse())) {
            throw new BusinessException("Les nouveaux mots de passe ne correspondent pas");
        }
        if (request.getNouveauMotDePasse().equals(request.getAncienMotDePasse())) {
            throw new BusinessException("Le nouveau mot de passe doit être différent de l'ancien");
        }

        user.setPassword(passwordEncoder.encode(request.getNouveauMotDePasse()));
        user.setDateModification(LocalDateTime.now());
        userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        List<String> permissions = new java.util.ArrayList<>(rbacService.permissionsDeUtilisateur(user.getId()));
        Integer medecinId = user.getRole() == Role.MEDECIN
                ? medecinRepository.findByEmail(user.getEmail()).map(Medecin::getIdMedecin).orElse(null)
                : null;
        return AuthResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .medecinId(medecinId)
                .token(token)
                .refreshToken(refreshToken)
                .expiresIn(jwtExpiration)
                .permissions(permissions)
                .build();
    }
}