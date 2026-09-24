package adc.gestion_hospitaliere.util;

import adc.gestion_hospitaliere.Enums.PermissionCode;
import adc.gestion_hospitaliere.Enums.Role;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

import static adc.gestion_hospitaliere.Enums.PermissionCode.*;

/**
 * Attribution par défaut des permissions à chaque rôle.
 * Sert à initialiser la table role_permissions et de repli si aucune
 * permission explicite n'est définie pour un utilisateur.
 */
public final class RolePermissions {

    private RolePermissions() {
    }

    public static final Set<PermissionCode> TOUTES = EnumSet.allOf(PermissionCode.class);

    private static final Map<Role, Set<PermissionCode>> DEFAUTS = Map.of(
            Role.ADMIN, TOUTES,
            Role.MEDECIN, EnumSet.of(
                    DASHBOARD_VOIR,
                    PATIENTS_VOIR,
                    CONSULTATIONS_VOIR, CONSULTATIONS_GERER,
                    RENDEZ_VOUS_VOIR, RENDEZ_VOUS_GERER,
                    PRESCRIPTIONS_VOIR, PRESCRIPTIONS_GERER,
                    EXAMENS_VOIR, EXAMENS_GERER, CATEGORIES_EXAMEN_VOIR,
                    HOSPITALISATIONS_VOIR, HOSPITALISATIONS_GERER,
                    CONSTANTES_VOIR, CONSTANTES_GERER,
                    CHAMBRES_VOIR,
                    SOINS_VOIR, SOINS_GERER,
                    MEDECINS_VOIR, MEDECINS_GERER,
                    SPECIALITES_VOIR, SPECIALITES_GERER,
                    PHARMACIE_VOIR,
                    URGENCES_VOIR, URGENCES_GERER,
                    FACTURATION_VOIR, CATALOGUE_VOIR,
                    NOTIFICATIONS_VOIR),
            Role.SECRETAIRE, EnumSet.of(
                    DASHBOARD_VOIR,
                    PATIENTS_VOIR, PATIENTS_AJOUTER, PATIENTS_MODIFIER, PATIENTS_SUPPRIMER,
                    CONSULTATIONS_VOIR,
                    RENDEZ_VOUS_VOIR, RENDEZ_VOUS_GERER,
                    PRESCRIPTIONS_VOIR,
                    EXAMENS_VOIR, CATEGORIES_EXAMEN_VOIR,
                    HOSPITALISATIONS_VOIR, HOSPITALISATIONS_GERER,
                    CONSTANTES_VOIR,
                    CHAMBRES_VOIR, CHAMBRES_GERER,
                    MEDECINS_VOIR, MEDECINS_GERER,
                    SPECIALITES_VOIR,
                    FACTURATION_VOIR, FACTURATION_GERER,
                    CATALOGUE_VOIR, CATALOGUE_GERER,
                    URGENCES_VOIR,
                    NOTIFICATIONS_VOIR),
            Role.INFIRMIER, EnumSet.of(
                    DASHBOARD_VOIR,
                    PATIENTS_VOIR,
                    HOSPITALISATIONS_VOIR,
                    CONSTANTES_VOIR, CONSTANTES_GERER,
                    CHAMBRES_VOIR,
                    SOINS_VOIR, SOINS_GERER,
                    URGENCES_VOIR, URGENCES_GERER,
                    NOTIFICATIONS_VOIR),
            Role.PHARMACIEN, EnumSet.of(
                    DASHBOARD_VOIR,
                    PATIENTS_VOIR,
                    PHARMACIE_VOIR, PHARMACIE_GERER,
                    NOTIFICATIONS_VOIR),
            Role.RH, EnumSet.of(
                    DASHBOARD_VOIR,
                    MEDECINS_VOIR,
                    PERSONNEL_VOIR, PERSONNEL_GERER,
                    NOTIFICATIONS_VOIR),
            Role.PATIENT, EnumSet.of(DASHBOARD_VOIR)
    );

    public static Set<PermissionCode> pour(Role role) {
        if (role == null) return EnumSet.noneOf(PermissionCode.class);
        return DEFAUTS.getOrDefault(role, EnumSet.noneOf(PermissionCode.class));
    }
}
