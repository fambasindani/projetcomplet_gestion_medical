package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

/**
 * Résout l'utilisateur actuellement authentifié et ce qui le concerne.
 * Sert à restreindre les données vues par un médecin à son propre périmètre.
 */
@Service
@RequiredArgsConstructor
public class CurrentUserService {

    private final UserRepository userRepository;
    private final MedecinRepository medecinRepository;

    public String emailCourant() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        String name = auth.getName();
        if (name == null || "anonymousUser".equals(name)) return null;
        return name;
    }

    public User utilisateurCourant() {
        String email = emailCourant();
        return email == null ? null : userRepository.findByEmail(email).orElse(null);
    }

    public Role roleCourant() {
        User u = utilisateurCourant();
        return u != null ? u.getRole() : null;
    }

    /** Id du médecin associé à l'utilisateur connecté, ou null si l'utilisateur n'est pas médecin. */
    public Integer medecinIdCourant() {
        User u = utilisateurCourant();
        if (u == null || u.getRole() != Role.MEDECIN) return null;
        return medecinRepository.findByEmail(u.getEmail())
                .map(Medecin::getIdMedecin)
                .orElse(null);
    }

    public boolean estMedecin() {
        return roleCourant() == Role.MEDECIN;
    }

    /**
     * Filtre à appliquer aux listes :
     * - null  => l'utilisateur n'est pas médecin (ADMIN/SECRETAIRE...) : voit tout ;
     * - >= 0  => id du médecin : ne voit que ses données ;
     * - -1    => médecin non rattaché à un enregistrement médecin : ne voit rien.
     */
    public Integer filtreMedecinId() {
        if (!estMedecin()) return null;
        Integer id = medecinIdCourant();
        return id != null ? id : -1;
    }

    /** Id du personnel (Personnel) lié au compte utilisateur, ou null. */
    public Integer personnelIdCourant() {
        User u = utilisateurCourant();
        if (u == null || u.getPersonnel() == null) return null;
        return u.getPersonnel().getIdPersonnel();
    }

    /**
     * Filtre à appliquer aux listes de soins pour un infirmier :
     * - null  => l'utilisateur n'est pas infirmier : voit tout ;
     * - >= 0  => id du personnel infirmier : ne voit que ses soins ;
     * - -1    => infirmier non rattaché à un personnel : ne voit rien.
     */
    public Integer filtreInfirmierId() {
        if (roleCourant() != Role.INFIRMIER) return null;
        Integer id = personnelIdCourant();
        return id != null ? id : -1;
    }
}
