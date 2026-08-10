package adc.gestion_hospitaliere.Entity;

import adc.gestion_hospitaliere.Enums.Role;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "utilisateurs")
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private Long id;

    @Column(name = "Nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "Prenom", nullable = false, length = 100)
    private String prenom;

    @Column(name = "Email", unique = true, nullable = false, length = 150)
    private String email;

    @Column(name = "Password", nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(name = "Role", nullable = false)
    private Role role;

    // User.java
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "personnel_id", referencedColumnName = "id_personnel")
    private Personnel personnel;

    @Column(name = "DateCreation", updatable = false)
    private LocalDateTime dateCreation;

    @Column(name = "DateModification")
    private LocalDateTime dateModification;

    @Column(name = "IsActive")
    private boolean isActive = true;

    // ✅ Auto dates
    @PrePersist
    public void prePersist() {
        this.dateCreation = LocalDateTime.now();
        this.dateModification = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        this.dateModification = LocalDateTime.now();
    }

    // ===== SPRING SECURITY =====

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.name()));
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override public boolean isAccountNonExpired() { return true; }

    @Override public boolean isAccountNonLocked() { return true; }

    @Override public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() {
        return isActive;
    }
}