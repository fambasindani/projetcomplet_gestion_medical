package adc.gestion_hospitaliere.service;

import adc.gestion_hospitaliere.Entity.Medecin;
import adc.gestion_hospitaliere.Entity.User;
import adc.gestion_hospitaliere.Enums.Role;
import adc.gestion_hospitaliere.Repository.MedecinRepository;
import adc.gestion_hospitaliere.Repository.PersonnelServiceRepository;
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
    private final adc.gestion_hospitaliere.Repository.PersonnelLaboratoireRepository personnelLaboratoireRepository;
    private final PersonnelServiceRepository personnelServiceRepository;

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

    // ==================== SCOPING PAR SERVICE / LABORATOIRE ====================

    /** Service (texte) du personnel lié au compte connecté, ou null. */
    public String serviceCourant() {
        User u = utilisateurCourant();
        if (u == null || u.getPersonnel() == null) return null;
        String service = u.getPersonnel().getService();
        return (service != null && !service.isBlank()) ? service.trim() : null;
    }

    /**
     * Laboratoire du laborantin connecté : son service (qui correspond à une
     * catégorie d'examen). En France, un technicien voit les examens de son
     * plateau technique, pas seulement les siens.
     */
    public String laboratoireCourant() {
        if (roleCourant() != Role.LABORANTIN) return null;
        return serviceCourant();
    }

    /**
     * Filtre à appliquer aux listes d'examens pour un laborantin :
     * - null  => pas laborantin : voit tout ;
     * - >= 0  => id du laboratoire : ne voit que les examens de son plateau ;
     * - -1    => laborantin non rattaché : ne voit rien.
     */
    public Integer filtreLaboratoireId() {
        if (roleCourant() != Role.LABORANTIN) return null;
        Integer id = laboratoireIdCourant();
        return id != null ? id : -1;
    }

    /** Id du laboratoire rattaché au personnel connecté, ou null. */
    public Integer laboratoireIdCourant() {
        Integer personnelId = personnelIdCourant();
        if (personnelId == null) return null;
        return personnelLaboratoireRepository.findFirstByIdPersonnel(personnelId)
                .map(adc.gestion_hospitaliere.Entity.PersonnelLaboratoire::getIdLaboratoire)
                .orElse(null);
    }

    /** Service de l'infirmier connecté (scope des soins et hospitalisations). */
    public String serviceInfirmierCourant() {
        if (roleCourant() != Role.INFIRMIER) return null;
        return serviceCourant();
    }

    /** Id du service affecté au personnel connecté (table personnel_service), ou null. */
    public Integer serviceIdCourant() {
        Integer personnelId = personnelIdCourant();
        if (personnelId == null) return null;
        return personnelServiceRepository.findByIdPersonnel(personnelId).stream()
                .map(adc.gestion_hospitaliere.Entity.PersonnelService::getIdService)
                .findFirst()
                .orElse(null);
    }

    /**
     * Filtre à appliquer aux listes pour un infirmier (scoping par service) :
     * - null  => pas infirmier : voit tout ;
     * - >= 0  => id du service affecté : ne voit que son service ;
     * - -1    => infirmier non affecté : ne voit rien.
     */
    public Integer filtreServiceInfirmierId() {
        if (roleCourant() != Role.INFIRMIER) return null;
        Integer id = serviceIdCourant();
        return id != null ? id : -1;
    }

    public boolean estLaborantin() {
        return roleCourant() == Role.LABORANTIN;
    }

    public boolean estInfirmier() {
        return roleCourant() == Role.INFIRMIER;
    }
}
