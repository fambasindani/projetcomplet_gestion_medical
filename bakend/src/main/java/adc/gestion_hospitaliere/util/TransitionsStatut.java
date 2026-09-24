package adc.gestion_hospitaliere.util;

import adc.gestion_hospitaliere.Enums.StatutAdmissionUrgence;
import adc.gestion_hospitaliere.Enums.StatutHospitalisation;
import adc.gestion_hospitaliere.Enums.StatutInterventionUrgence;
import adc.gestion_hospitaliere.Enums.StatutPrescription;
import adc.gestion_hospitaliere.Enums.StatutRendezVous;
import adc.gestion_hospitaliere.Enums.StatutSoin;
import adc.gestion_hospitaliere.exception.BusinessException;

import java.util.EnumSet;
import java.util.Map;
import java.util.Set;

/**
 * Règles centralisées de transitions d'état métier.
 * Toute transition non listée est refusée.
 */
public final class TransitionsStatut {

    private TransitionsStatut() {
    }

    private static final Map<StatutRendezVous, Set<StatutRendezVous>> RDV = Map.of(
            StatutRendezVous.Programmé, EnumSet.of(StatutRendezVous.Confirmé, StatutRendezVous.Annulé, StatutRendezVous.Terminé, StatutRendezVous.Non_présenté),
            StatutRendezVous.Confirmé, EnumSet.of(StatutRendezVous.Annulé, StatutRendezVous.Terminé, StatutRendezVous.Non_présenté),
            StatutRendezVous.Annulé, EnumSet.noneOf(StatutRendezVous.class),
            StatutRendezVous.Terminé, EnumSet.noneOf(StatutRendezVous.class),
            StatutRendezVous.Non_présenté, EnumSet.noneOf(StatutRendezVous.class)
    );

    private static final Map<StatutHospitalisation, Set<StatutHospitalisation>> HOSPITALISATION = Map.of(
            StatutHospitalisation.En_cours, EnumSet.of(StatutHospitalisation.Terminée, StatutHospitalisation.Transféré, StatutHospitalisation.Décédé, StatutHospitalisation.Sortie_contre_avis),
            StatutHospitalisation.Terminée, EnumSet.noneOf(StatutHospitalisation.class),
            StatutHospitalisation.Transféré, EnumSet.noneOf(StatutHospitalisation.class),
            StatutHospitalisation.Décédé, EnumSet.noneOf(StatutHospitalisation.class),
            StatutHospitalisation.Sortie_contre_avis, EnumSet.noneOf(StatutHospitalisation.class)
    );

    private static final Map<StatutAdmissionUrgence, Set<StatutAdmissionUrgence>> ADMISSION = Map.of(
            StatutAdmissionUrgence.En_attente, EnumSet.of(StatutAdmissionUrgence.En_consultation, StatutAdmissionUrgence.En_observation, StatutAdmissionUrgence.Hospitalise, StatutAdmissionUrgence.Sorti, StatutAdmissionUrgence.Transfere),
            StatutAdmissionUrgence.En_consultation, EnumSet.of(StatutAdmissionUrgence.En_observation, StatutAdmissionUrgence.Hospitalise, StatutAdmissionUrgence.Sorti, StatutAdmissionUrgence.Transfere),
            StatutAdmissionUrgence.En_observation, EnumSet.of(StatutAdmissionUrgence.Hospitalise, StatutAdmissionUrgence.Sorti, StatutAdmissionUrgence.Transfere),
            StatutAdmissionUrgence.Hospitalise, EnumSet.noneOf(StatutAdmissionUrgence.class),
            StatutAdmissionUrgence.Sorti, EnumSet.noneOf(StatutAdmissionUrgence.class),
            StatutAdmissionUrgence.Transfere, EnumSet.noneOf(StatutAdmissionUrgence.class)
    );

    private static final Map<StatutInterventionUrgence, Set<StatutInterventionUrgence>> INTERVENTION = Map.of(
            StatutInterventionUrgence.Planifiee, EnumSet.of(StatutInterventionUrgence.En_cours, StatutInterventionUrgence.Annulee),
            StatutInterventionUrgence.En_cours, EnumSet.of(StatutInterventionUrgence.Terminee, StatutInterventionUrgence.Annulee),
            StatutInterventionUrgence.Terminee, EnumSet.noneOf(StatutInterventionUrgence.class),
            StatutInterventionUrgence.Annulee, EnumSet.noneOf(StatutInterventionUrgence.class)
    );

    private static final Map<StatutPrescription, Set<StatutPrescription>> PRESCRIPTION = Map.of(
            StatutPrescription.EnAttente, EnumSet.of(StatutPrescription.Active, StatutPrescription.Annulee),
            StatutPrescription.Active, EnumSet.of(StatutPrescription.Terminee, StatutPrescription.Annulee),
            StatutPrescription.Terminee, EnumSet.noneOf(StatutPrescription.class),
            StatutPrescription.Annulee, EnumSet.noneOf(StatutPrescription.class)
    );

    private static final Map<StatutSoin, Set<StatutSoin>> SOIN = Map.of(
            StatutSoin.Prescrit, EnumSet.of(StatutSoin.EnCours, StatutSoin.Realise, StatutSoin.Annule),
            StatutSoin.EnCours, EnumSet.of(StatutSoin.Realise, StatutSoin.Annule),
            StatutSoin.Realise, EnumSet.noneOf(StatutSoin.class),
            StatutSoin.Annule, EnumSet.noneOf(StatutSoin.class)
    );

    public static void verifierRendezVous(StatutRendezVous actuel, StatutRendezVous nouveau) {
        verifier("rendez-vous", actuel, nouveau, RDV);
    }

    public static void verifierHospitalisation(StatutHospitalisation actuel, StatutHospitalisation nouveau) {
        verifier("hospitalisation", actuel, nouveau, HOSPITALISATION);
    }

    public static void verifierAdmissionUrgence(StatutAdmissionUrgence actuel, StatutAdmissionUrgence nouveau) {
        verifier("admission aux urgences", actuel, nouveau, ADMISSION);
    }

    public static void verifierInterventionUrgence(StatutInterventionUrgence actuel, StatutInterventionUrgence nouveau) {
        verifier("intervention d'urgence", actuel, nouveau, INTERVENTION);
    }

    public static void verifierPrescription(StatutPrescription actuel, StatutPrescription nouveau) {
        verifier("prescription", actuel, nouveau, PRESCRIPTION);
    }

    public static void verifierSoin(StatutSoin actuel, StatutSoin nouveau) {
        verifier("soin", actuel, nouveau, SOIN);
    }

    private static <T> void verifier(String libelle, T actuel, T nouveau, Map<T, Set<T>> transitions) {
        if (actuel == null || nouveau == null) return;
        if (actuel == nouveau) return;
        if (!transitions.getOrDefault(actuel, Set.of()).contains(nouveau)) {
            throw new BusinessException("Transition de statut invalide pour " + libelle
                    + " : " + actuel + " → " + nouveau);
        }
    }
}
