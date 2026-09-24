import { ConfidentialiteExamen, StatutExamen } from "./examen";
import { StatutSoin } from "./soin";

export enum TypePrescription {
  Medicament = 'Médicament',
  Examen = 'Examen',
  Soin = 'Soin',
  Reeducation = 'Rééducation',
  Regime = 'Régime'
}

export enum StatutPrescription {
  Active = 'Active',
  Terminee = 'Terminee',
  Annulee = 'Annulee',
  EnAttente = 'EnAttente'
}

export interface PrescriptionExamen {
  typeExamen: string;
  idCategorieExamen: number;
  datePlanification?: string;
  dateRealisation?: string;
  laboratoire?: string;
  technicien?: string;
  statut?: StatutExamen;
  confidentialite?: ConfidentialiteExamen;
}

export interface PrescriptionSoin {
  description: string;
  instructions?: string;
  frequence?: string;
  duree?: string;
  statut?: StatutSoin;
}

export interface Prescription {
  idPrescription: number;
  numeroPrescription: string;
  idConsultation: number | null;
  idHospitalisation: number | null;
  idMedecin: number;
  medecinNom: string;
  medecinPrenom: string;
  idPatient: number;
  patientNom: string;
  patientPrenom: string;
  datePrescription: string;
  typePrescription: TypePrescription;
  description: string;
  instructions: string | null;
  urgente: boolean;
  dateDebut: string | null;
  dateFin: string | null;
  statut: StatutPrescription;
  dateAnnulation: string | null;
  motifAnnulation: string | null;
  notesComplementaires: string | null;
}

export interface PrescriptionMedicament {
  idPrescriptionMed: number;
  idMedicament: number;
  medicamentNom: string | null;
  posologie: string;
  dureeTraitement: string | null;
  quantitePrescrite: number;
  quantiteDelivree: number | null;
  instructions: string | null;
  renouvelable: boolean;
  nombreRenouvellements: number | null;
  dateDebut: string | null;
  dateFin: string | null;
}

export interface PrescriptionMedicamentCreate {
  idMedicament: number;
  medicamentNom?: string | null;
  posologie: string;
  dureeTraitement?: string | null;
  quantitePrescrite: number;
  quantiteDelivree?: number | null;
  instructions?: string | null;
  renouvelable?: boolean;
  nombreRenouvellements?: number | null;
  dateDebut?: string | null;
  dateFin?: string | null;
}

export interface Prescription {
  idPrescription: number;
  numeroPrescription: string;
  idConsultation: number | null;
  idHospitalisation: number | null;
  idMedecin: number;
  medecinNom: string;
  medecinPrenom: string;
  idPatient: number;
  patientNom: string;
  patientPrenom: string;
  datePrescription: string;
  typePrescription: TypePrescription;
  description: string;
  instructions: string | null;
  urgente: boolean;
  dateDebut: string | null;
  dateFin: string | null;
  statut: StatutPrescription;
  dateAnnulation: string | null;
  motifAnnulation: string | null;
  notesComplementaires: string | null;
  prescriptionsMedicaments?: PrescriptionMedicament[];
}

export type PrescriptionCreate = Omit<Prescription,
  'idPrescription' | 'numeroPrescription' | 'medecinNom' | 'medecinPrenom' | 'patientNom' | 'patientPrenom' | 'dateAnnulation' | 'motifAnnulation' | 'prescriptionsMedicaments'
> & { prescriptionsMedicaments?: PrescriptionMedicamentCreate[] };