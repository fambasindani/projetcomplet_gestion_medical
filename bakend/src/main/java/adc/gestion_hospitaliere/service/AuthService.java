package adc.gestion_hospitaliere.service;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.exception.BusinessException;


import adc.gestion_hospitaliere.Entity.Personnel;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Repository.PersonnelRepository;
import adc.gestion_hospitaliere.Repository.UserRepository;
import adc.gestion_hospitaliere.dto.auth.AuthResponse;
import adc.gestion_hospitaliere.dto.auth.LoginRequest;
import adc.gestion_hospitaliere.dto.auth.RegisterRequest;
import adc.gestion_hospitaliere.dto.auth.UserCreateDto;
import adc.gestion_hospitaliere.dto.auth.UserUpdateDto;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PersonnelRepository personnelRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

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

        return userRepository.save(user);
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
        if (dto.getRole() != null) {
            user.setRole(dto.getRole());
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
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("Utilisateur non trouvé");
        }
        userRepository.deleteById(id);
    }

    // ==================== AUTHENTIFICATION ====================

    public AuthResponse register(RegisterRequest request) {
        Personnel personnel = personnelRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Aucun personnel trouvé avec l'email : " + request.getEmail() +
                                ". Impossible de créer un compte utilisateur."));

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Un utilisateur avec cet email existe déjà");
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BusinessException("Les mots de passe ne correspondent pas");
        }

        User user = User.builder()
                .nom(personnel.getNom())
                .prenom(personnel.getPrenom())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .isActive(true)
                .personnel(personnel)
                .dateCreation(LocalDateTime.now())
                .dateModification(LocalDateTime.now())
                .build();

        user = userRepository.save(user);

        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return buildAuthResponse(user, token, refreshToken);
    }

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

    private AuthResponse buildAuthResponse(User user, String token, String refreshToken) {
        return AuthResponse.builder()
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .token(token)
                .refreshToken(refreshToken)
                .expiresIn(System.currentTimeMillis() + 3600000)
                .build();
    }
}