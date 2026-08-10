export enum GraviteUrgence {
  Critique = 'Critique',
  Urgente = 'Urgente',
  Semi_urgente = 'Semi_urgente',
  Non_urgente = 'Non_urgente',
}

export enum StatutAdmissionUrgence {
  En_attente = 'En_attente',
  En_consultation = 'En_consultation',
  En_observation = 'En_observation',
  Hospitalise = 'Hospitalise',
  Sorti = 'Sorti',
  Transfere = 'Transfere',
}

export enum StatutInterventionUrgence {
  Planifiee = 'Planifiee',
  En_cours = 'En_cours',
  Terminee = 'Terminee',
  Annulee = 'Annulee',
}

export const GraviteUrgenceLabels: Record<GraviteUrgence, string> = {
  Critique: 'Critique',
  Urgente: 'Urgente',
  Semi_urgente: 'Semi-urgente',
  Non_urgente: 'Non urgente',
};

export const StatutAdmissionUrgenceLabels: Record<StatutAdmissionUrgence, string> = {
  En_attente: 'En attente',
  En_consultation: 'En consultation',
  En_observation: 'En observation',
  Hospitalise: 'Hospitalisé',
  Sorti: 'Sorti',
  Transfere: 'Transféré',
};

export const StatutInterventionUrgenceLabels: Record<StatutInterventionUrgence, string> = {
  Planifiee: 'Planifiée',
  En_cours: 'En cours',
  Terminee: 'Terminée',
  Annulee: 'Annulée',
};

export const GraviteUrgenceValues = Object.values(GraviteUrgence);
export const StatutAdmissionUrgenceValues = Object.values(StatutAdmissionUrgence);
export const StatutInterventionUrgenceValues = Object.values(StatutInterventionUrgence);

export interface AdmissionUrgence {
  idAdmissionUrgence: number;
  numeroAdmission: string;
  idPatient: number;
  patientNom: string | null;
  patientPrenom: string | null;
  idMedecin: number | null;
  medecinNom: string | null;
  medecinPrenom: string | null;
  dateArrivee: string;
  motifUrgent: string;
  gravite: GraviteUrgence;
  symptomes: string | null;
  tensionArterielle: string | null;
  pouls: number | null;
  temperature: number | null;
  saturationOxygene: number | null;
  statut: StatutAdmissionUrgence;
  datePriseEnCharge: string | null;
  orientation: string | null;
  notes: string | null;
  dateCreation: string;
}

export interface AdmissionUrgenceCreate {
  numeroAdmission?: string;
  idPatient: number | null;
  idMedecin?: number | null;
  dateArrivee: string;
  motifUrgent: string;
  gravite?: GraviteUrgence;
  symptomes?: string | null;
  tensionArterielle?: string | null;
  pouls?: number | null;
  temperature?: number | null;
  saturationOxygene?: number | null;
  statut?: StatutAdmissionUrgence;
  datePriseEnCharge?: string | null;
  orientation?: string | null;
  notes?: string | null;
}

export interface InterventionUrgence {
  idInterventionUrgence: number;
  numeroIntervention: string;
  idPatient: number;
  patientNom: string | null;
  patientPrenom: string | null;
  idAdmissionUrgence: number | null;
  idMedecinPrincipal: number;
  medecinNom: string | null;
  medecinPrenom: string | null;
  typeIntervention: string;
  dateIntervention: string;
  lieu: string | null;
  dureePrevue: number | null;
  actesRealises: string | null;
  materielUtilise: string | null;
  complications: string | null;
  resultat: string | null;
  statut: StatutInterventionUrgence;
  notes: string | null;
  dateCreation: string;
}

export interface InterventionUrgenceCreate {
  numeroIntervention?: string;
  idPatient: number | null;
  idAdmissionUrgence?: number | null;
  idMedecinPrincipal: number | null;
  typeIntervention: string;
  dateIntervention: string;
  lieu?: string | null;
  dureePrevue?: number | null;
  actesRealises?: string | null;
  materielUtilise?: string | null;
  complications?: string | null;
  resultat?: string | null;
  statut?: StatutInterventionUrgence;
  notes?: string | null;
}
