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
 * Sert à restreindre les données vues par un médecin / infirmier / patient
 * à son propre périmètre.
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

    /** Id du médecin associé à l'utilisateur connecté, ou null. */
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
     * - null  => l'utilisateur n'est pas médecin : voit tout ;
     * - >= 0  => id du médecin : ne voit que ses données ;
     * - -1    => médecin non rattaché : ne voit rien.
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
     * - null  => pas infirmier : voit tout ;
     * - >= 0  => id du personnel infirmier : ne voit que ses soins ;
     * - -1    => infirmier non rattaché : ne voit rien.
     */
    public Integer filtreInfirmierId() {
        if (roleCourant() != Role.INFIRMIER) return null;
        Integer id = personnelIdCourant();
        return id != null ? id : -1;
    }

    // ==================== PORTAIL PATIENT ====================

    /** Id du patient lié au compte connecté (portail patient), ou null. */
    public Integer patientIdCourant() {
        User u = utilisateurCourant();
        if (u == null || u.getPatient() == null) return null;
        return u.getPatient().getIdPatient();
    }

    public boolean estPatient() {
        return roleCourant() == Role.PATIENT;
    }

    /**
     * Garde-fou du portail patient : renvoie l'id du patient lié au compte,
     * ou lève une exception si le compte n'est pas relié à un dossier patient.
     */
    public Integer patientIdObligatoire() {
        Integer id = patientIdCourant();
        if (id == null) {
            throw new adc.gestion_hospitaliere.exception.BusinessException(
                    "Votre compte n'est pas relié à un dossier patient");
        }
        return id;
    }
}
