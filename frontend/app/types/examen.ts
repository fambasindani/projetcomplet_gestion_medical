export type StatutExamen = 'Prescrit' | 'Planifié' | 'En_cours' | 'Réalisé' | 'Validé' | 'Annulé';
export type ConfidentialiteExamen = 'Normal' | 'Confidentiel' | 'Très_confidentiel';

export const STATUT_EXAMEN_OPTIONS: StatutExamen[] = [
  'Prescrit', 'Planifié', 'En_cours', 'Réalisé', 'Validé', 'Annulé'
];
export const CONFIDENTIALITE_OPTIONS: ConfidentialiteExamen[] = [
  'Normal', 'Confidentiel', 'Très_confidentiel'
];

export interface CategorieExamen {
  idCategorieExamen: number;
  code: string;
  libelle: string;
  description?: string;
  actif: boolean;
  dateCreation: string;
}

export interface Examen {
  idExamen: number;
  numeroExamen: string;
  idPrescription?: number;
  idPatient: number;
  patientNom: string;
  idMedecinPrescripteur: number;
  medecinNom: string;
  typeExamen: string;
  idCategorieExamen: number;
  libelleCategorie: string;
  idActeCatalogue?: number;
  libelleActeCatalogue?: string;
  prixActeCatalogue?: number;
  datePrescription: string;
  datePlanification?: string;
  dateRealisation?: string;
  laboratoire?: string;
  technicien?: string;
  resultat?: string;
  interpretation?: string;
  fichierJoint?: string;
  compteRendu?: string;
  anomalies?: string;
  conclusion?: string;
  statut: StatutExamen;
  dateValidation?: string;
  validePar?: number;
  validateurNom?: string;
  confidentialite: ConfidentialiteExamen;
}

export interface ExamenRequest {
  idPrescription?: number;
  idPatient: number;
  idMedecinPrescripteur: number;
  typeExamen: string;
  idCategorieExamen: number;
  idActeCatalogue?: number | null;
  datePrescription?: string;
  datePlanification?: string;
  dateRealisation?: string;
  laboratoire?: string;
  technicien?: string;
  resultat?: string;
  interpretation?: string;
  fichierJoint?: string;
  compteRendu?: string;
  anomalies?: string;
  conclusion?: string;
  statut?: StatutExamen;
  confidentialite?: ConfidentialiteExamen;
}