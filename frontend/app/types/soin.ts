export enum StatutSoin {
  Prescrit = 'Prescrit',
  EnCours = 'EnCours',
  Realise = 'Realise',
  Annule = 'Annule'
}

export const STATUT_SOIN_OPTIONS = Object.values(StatutSoin).map(s => ({ value: s, label: s }));

// Pour les soins liés à une prescription (formulaire)
export interface PrescriptionSoin {
  description: string;
  instructions?: string;
  frequence?: string;
  duree?: string;
  statut?: StatutSoin;
}

export interface PrescriptionSoinRequest {
  idPrescription: number;
  idPatient: number;
  idInfirmier?: number;
  description: string;
  instructions?: string;
  frequence?: string;
  duree?: string;
  statut?: StatutSoin;
}

// Pour les soins liés à une hospitalisation (existant)
export interface SoinInfirmier {
  idSoin: number;
  idHospitalisation: number;
  patientNom: string;
  idInfirmier: number;
  infirmierNom: string;
  dateSoin: string;
  typeSoin: string;
  description: string;
  observations: string;
  signatureInfirmier: boolean;
}

export interface SoinInfirmierRequest {
  idHospitalisation: number;
  idInfirmier: number;
  dateSoin: string;
  typeSoin: string;
  description?: string;
  observations?: string;
  signatureInfirmier?: boolean;
}

export interface SoinPrescrit {
  idSoin: number;
  idPrescription: number;
  idPatient: number;
  idInfirmier?: number;
  description: string;
  instructions?: string;
  frequence?: string;
  duree?: string;
  statut: StatutSoin;
  datePrescription: string;
  patientNom?: string;
  infirmierNom?: string;
}

export interface SoinPrescritRequest {
  idPrescription: number;
  idPatient: number;
  idInfirmier?: number;
  description: string;
  instructions?: string;
  frequence?: string;
  duree?: string;
  statut?: StatutSoin;
}