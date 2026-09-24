package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Permission;
import adc.gestion_hospitaliere.Entity.RoleEntity;
import adc.gestion_hospitaliere.Entity.RolePermission;
import adc.gestion_hospitaliere.Entity.RolePermissionId;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Entity.UserRole;
import adc.gestion_hospitaliere.Entity.UserRoleId;
import adc.gestion_hospitaliere.Enums.PermissionCode;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Repository.PermissionRepository;
import adc.gestion_hospitaliere.Repository.RoleEntityRepository;
import adc.gestion_hospitaliere.Repository.RolePermissionRepository;
import adc.gestion_hospitaliere.Repository.UserRepository;
import adc.gestion_hospitaliere.Repository.UserRoleRepository;
import adc.gestion_hospitaliere.dto.rbac.PermissionDto;
import adc.gestion_hospitaliere.dto.rbac.RoleDto;
import adc.gestion_hospitaliere.exception.BusinessException;
import adc.gestion_hospitaliere.exception.ResourceNotFoundException;
import adc.gestion_hospitaliere.util.RolePermissions;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RbacService {

    private final PermissionRepository permissionRepository;
    private final RoleEntityRepository roleEntityRepository;
    private final RolePermissionRepository rolePermissionRepository;
    private final UserRoleRepository userRoleRepository;
    private final UserRepository userRepository;

    // ---------- INITIALISATION ----------

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void initialiserRbac() {
        // Seed additif et idempotent : crée uniquement ce qui manque
        // (corrige les incohérences de données et prend en compte les nouvelles permissions).
        seedPermissions();
        seedRoles();
        seedRolePermissions();
        seedUserRoles();
    }

    private void seedPermissions() {
        for (PermissionCode code : PermissionCode.values()) {
            if (permissionRepository.findByCode(code.name()).isPresent()) continue;
            permissionRepository.save(Permission.builder()
                    .code(code.name())
                    .libelle(code.name().replace('_', ' ').toLowerCase())
                    .module(moduleOf(code.name()))
                    .build());
        }
    }

    private void seedRoles() {
        for (Role role : Role.values()) {
            if (roleEntityRepository.findByNom(role.name()).isPresent()) continue;
            roleEntityRepository.save(RoleEntity.builder()
                    .nom(role.name())
                    .description("Rôle " + role.name())
                    .build());
        }
    }

    private void seedRolePermissions() {
        for (Role role : Role.values()) {
            RoleEntity roleEntity = roleEntityRepository.findByNom(role.name()).orElse(null);
            if (roleEntity == null) continue;
            for (PermissionCode code : RolePermissions.pour(role)) {
                Permission permission = permissionRepository.findByCode(code.name()).orElse(null);
                if (permission == null) continue;
                RolePermissionId id = RolePermissionId.builder()
                        .idRole(roleEntity.getId())
                        .idPermission(permission.getId())
                        .build();
                if (rolePermissionRepository.existsById(id)) continue;
                rolePermissionRepository.save(RolePermission.builder()
                        .id(id)
                        .role(roleEntity)
                        .permission(permission)
                        .build());
            }
        }
    }

    private void seedUserRoles() {
        for (User user : userRepository.findAll()) {
            if (user.getRole() == null) continue;
            if (!userRoleRepository.findByIdUtilisateur(user.getId()).isEmpty()) continue;
            RoleEntity roleEntity = roleEntityRepository.findByNom(user.getRole().name()).orElse(null);
            if (roleEntity == null) continue;
            userRoleRepository.save(UserRole.builder()
                    .id(UserRoleId.builder()
                            .idUtilisateur(user.getId())
                            .idRole(roleEntity.getId())
                            .build())
                    .utilisateur(user)
                    .role(roleEntity)
                    .build());
        }
    }

    // ---------- LECTURE ----------

    @Transactional(readOnly = true)
    public Set<String> permissionsDeUtilisateur(Long idUtilisateur) {
        Set<String> result = new LinkedHashSet<>();
        for (UserRole userRole : userRoleRepository.findByIdUtilisateur(idUtilisateur)) {
            for (RolePermission rp : rolePermissionRepository.findByIdRole(userRole.getRole().getId())) {
                result.add(rp.getPermission().getCode());
            }
        }
        if (result.isEmpty()) {
            User user = userRepository.findById(idUtilisateur).orElse(null);
            if (user != null) {
                RolePermissions.pour(user.getRole()).forEach(c -> result.add(c.name()));
            }
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Set<String> rolesDeUtilisateur(Long idUtilisateur) {
        Set<String> roles = new LinkedHashSet<>();
        for (UserRole userRole : userRoleRepository.findByIdUtilisateur(idUtilisateur)) {
            roles.add(userRole.getRole().getNom());
        }
        if (roles.isEmpty()) {
            userRepository.findById(idUtilisateur).map(User::getRole)
                    .ifPresent(r -> roles.add(r.name()));
        }
        return roles;
    }

    @Transactional(readOnly = true)
    public Page<RoleDto> listerRoles(Pageable pageable) {
        return roleEntityRepository.findAll(pageable).map(this::toRoleDto);
    }

    @Transactional(readOnly = true)
    public RoleDto getRole(Long id) {
        return toRoleDto(roleEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable")));
    }

    @Transactional(readOnly = true)
    public Page<PermissionDto> listerPermissions(Pageable pageable) {
        return permissionRepository.findAll(pageable).map(this::toPermissionDto);
    }

    // ---------- CRUD RÔLES ----------

    @Transactional
    public RoleDto creerRole(String nom, String description) {
        String clean = nom == null ? "" : nom.trim();
        if (clean.isEmpty()) {
            throw new BusinessException("Le nom du rôle est requis");
        }
        if (roleEntityRepository.findByNom(clean).isPresent()) {
            throw new BusinessException("Un rôle avec ce nom existe déjà");
        }
        RoleEntity role = roleEntityRepository.save(RoleEntity.builder()
                .nom(clean)
                .description(description)
                .build());
        return toRoleDto(role);
    }

    @Transactional
    public RoleDto modifierRole(Long id, String nom, String description) {
        RoleEntity role = roleEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable"));
        if (nom != null && !nom.trim().isEmpty() && !nom.trim().equals(role.getNom())) {
            if (roleEntityRepository.findByNom(nom.trim()).isPresent()) {
                throw new BusinessException("Un rôle avec ce nom existe déjà");
            }
            role.setNom(nom.trim());
        }
        role.setDescription(description);
        return toRoleDto(roleEntityRepository.save(role));
    }

    @Transactional
    public void supprimerRole(Long id) {
        RoleEntity role = roleEntityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable"));
        if (userRoleRepository.countByIdRole(id) > 0) {
            throw new BusinessException("Impossible de supprimer un rôle attribué à des utilisateurs");
        }
        rolePermissionRepository.deleteByIdRole(id);
        rolePermissionRepository.flush();
        roleEntityRepository.delete(role);
    }

    // ---------- CRUD PERMISSIONS ----------

    @Transactional
    public PermissionDto creerPermission(String code, String libelle, String module) {
        String clean = code == null ? "" : code.trim().toUpperCase();
        if (clean.isEmpty()) {
            throw new BusinessException("Le code de la permission est requis");
        }
        if (permissionRepository.findByCode(clean).isPresent()) {
            throw new BusinessException("Une permission avec ce code existe déjà");
        }
        Permission permission = permissionRepository.save(Permission.builder()
                .code(clean)
                .libelle(libelle != null && !libelle.isBlank() ? libelle : clean)
                .module(module != null && !module.isBlank() ? module : moduleOf(clean))
                .build());
        return toPermissionDto(permission);
    }

    @Transactional
    public PermissionDto modifierPermission(Long id, String libelle, String module) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission introuvable"));
        if (libelle != null && !libelle.isBlank()) permission.setLibelle(libelle);
        if (module != null && !module.isBlank()) permission.setModule(module);
        return toPermissionDto(permissionRepository.save(permission));
    }

    @Transactional
    public void supprimerPermission(Long id) {
        Permission permission = permissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Permission introuvable"));
        rolePermissionRepository.deleteByIdPermission(id);
        rolePermissionRepository.flush();
        permissionRepository.delete(permission);
    }

    // ---------- AFFECTATIONS ----------

    @Transactional
    public void affecterPermissionsAuRole(String nomRole, Set<String> codes) {
        RoleEntity roleEntity = roleEntityRepository.findByNom(nomRole)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable : " + nomRole));
        rolePermissionRepository.deleteByIdRole(roleEntity.getId());
        rolePermissionRepository.flush();
        if (codes == null) return;
        for (String code : codes) {
            Permission permission = permissionRepository.findByCode(code)
                    .orElseThrow(() -> new ResourceNotFoundException("Permission introuvable : " + code));
            rolePermissionRepository.save(RolePermission.builder()
                    .id(RolePermissionId.builder()
                            .idRole(roleEntity.getId())
                            .idPermission(permission.getId())
                            .build())
                    .role(roleEntity)
                    .permission(permission)
                    .build());
        }
    }

    @Transactional
    public void ajouterPermissionAuRole(String nomRole, String code) {
        RoleEntity roleEntity = roleEntityRepository.findByNom(nomRole)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable : " + nomRole));
        Permission permission = permissionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Permission introuvable : " + code));
        RolePermissionId id = RolePermissionId.builder()
                .idRole(roleEntity.getId())
                .idPermission(permission.getId())
                .build();
        if (rolePermissionRepository.existsById(id)) return;
        rolePermissionRepository.save(RolePermission.builder()
                .id(id)
                .role(roleEntity)
                .permission(permission)
                .build());
    }

    @Transactional
    public void retirerPermissionDuRole(String nomRole, String code) {
        RoleEntity roleEntity = roleEntityRepository.findByNom(nomRole)
                .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable : " + nomRole));
        Permission permission = permissionRepository.findByCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Permission introuvable : " + code));
        rolePermissionRepository.deleteById(RolePermissionId.builder()
                .idRole(roleEntity.getId())
                .idPermission(permission.getId())
                .build());
    }

    @Transactional
    public void affecterRolesAUtilisateur(Long idUtilisateur, Set<String> roles) {
        User user = userRepository.findById(idUtilisateur)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable"));
        userRoleRepository.deleteByIdUtilisateur(idUtilisateur);
        userRoleRepository.flush();
        if (roles == null) return;
        for (String nomRole : roles) {
            RoleEntity roleEntity = roleEntityRepository.findByNom(nomRole)
                    .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable : " + nomRole));
            userRoleRepository.save(UserRole.builder()
                    .id(UserRoleId.builder()
                            .idUtilisateur(idUtilisateur)
                            .idRole(roleEntity.getId())
                            .build())
                    .utilisateur(user)
                    .role(roleEntity)
                    .build());
        }
    }

    // ---------- MAPPING ----------

    private RoleDto toRoleDto(RoleEntity role) {
        List<String> permissions = rolePermissionRepository.findByIdRole(role.getId()).stream()
                .map(rp -> rp.getPermission().getCode())
                .collect(Collectors.toCollection(ArrayList::new));
        return RoleDto.builder()
                .id(role.getId())
                .nom(role.getNom())
                .description(role.getDescription())
                .permissions(permissions)
                .build();
    }

    private PermissionDto toPermissionDto(Permission permission) {
        return PermissionDto.builder()
                .id(permission.getId())
                .code(permission.getCode())
                .libelle(permission.getLibelle())
                .module(permission.getModule())
                .build();
    }

    private String moduleOf(String code) {
        int idx = code.lastIndexOf('_');
        return idx > 0 ? code.substring(0, idx) : code;
    }
}
