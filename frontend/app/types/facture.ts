// app/types/facture.ts

export type CategorieActeMedical =
  | 'Consultation'
  | 'Intervention'
  | 'Examen'
  | 'Soin'
  | 'Hospitalisation'
  | 'Pharmacie';

export interface ActeMedical {
  idActe: number;
  codeActe: string;
  libelle: string;
  description: string | null;
  prixBase: number;
  categorie: CategorieActeMedical;
  coefficient: number | null;
  lettreCle: string | null;
  remboursable: boolean;
  tauxRemboursement: number | null;
  actif: boolean;
}

export interface ActeMedicalCreate {
  codeActe: string;
  libelle: string;
  description: string | null;
  prixBase: number;
  categorie: CategorieActeMedical;
  coefficient: number | null;
  lettreCle: string | null;
  remboursable: boolean;
  tauxRemboursement: number | null;
  actif: boolean;
}

export type StatutFacture = 'En_attente' | 'Partiellement_payé' | 'Payé' | 'Annulé' | 'Impayé';

export type ModePaiement =
  | 'Espèces'
  | 'Carte_bancaire'
  | 'Chèque'
  | 'Virement'
  | 'Prélèvement'
  | 'En_ligne';

export type StatutPaiement = 'Effectue' | 'En_attente' | 'Refusé' | 'Remboursé';

export interface DetailFacture {
  idDetail: number;
  idFacture: number;
  idActe: number | null;
  acteLibelle: string | null;
  idActeCatalogue: number | null;
  acteCatalogueLibelle: string | null;
  idMedicament: number | null;
  medicamentNom: string | null;
  source: string | null;
  description: string | null;
  quantite: number;
  prixUnitaire: number;
  remise: number;
  montantHt: number;
  montantTtc: number;
}

export interface Paiement {
  idPaiement: number;
  idFacture: number;
  datePaiement: string;
  montant: number;
  modePaiement: ModePaiement;
  referencePaiement: string | null;
  encaissePar: number | null;
  encaisseurNom: string | null;
  statut: StatutPaiement;
  notes: string | null;
}

export interface Facture {
  idFacture: number;
  numeroFacture: string;
  idPatient: number;
  patientNom: string;
  patientPrenom: string;
  idHospitalisation: number | null;
  idConsultation: number | null;
  dateEmission: string;
  dateEcheance: string | null;
  montantHt: number;
  tva: number;
  montantTtc: number;
  montantPaye: number;
  montantRestant: number;
  statut: StatutFacture;
  modePaiement: ModePaiement | null;
  assurancePriseEnCharge: boolean;
  tauxAssurance: number | null;
  montantAssurance: number | null;
  mutuelleId: string | null;
  mutuellePriseEnCharge: number | null;
  resteAChargePatient: number | null;
  datePaiementTotal: string | null;
  notesComptables: string | null;
  details: DetailFacture[];
  paiements: Paiement[];
}

export interface FactureDetailLigne {
  idActe: number | null;
  idActeCatalogue: number | null;
  idMedicament: number | null;
  source: string | null;
  idSource: number | null;
  description: string | null;
  quantite: number;
  prixUnitaire: number;
  remise: number;
}

export interface FactureCreate {
  idPatient: number;
  idHospitalisation: number | null;
  idConsultation: number | null;
  dateEcheance: string | null;
  tva: number;
  assurancePriseEnCharge: boolean;
  tauxAssurance: number | null;
  mutuelleId: string | null;
  mutuellePriseEnCharge: number | null;
  notesComptables: string | null;
  details: FactureDetailLigne[];
}

export interface PaiementCreate {
  montant: number;
  modePaiement: ModePaiement;
  referencePaiement: string | null;
  encaissePar: number | null;
  notes: string | null;
}

export interface FactureStats {
  totalFactures: number;
  totalMontantEmis: number;
  totalPaye: number;
  totalRestant: number;
  parStatut: Array<{ statut: StatutFacture; nombre: number; montant: number }>;
  parMois: Array<{ mois: string; nombre: number; montant: number }>;
}

export const StatutFactureLabels: Record<StatutFacture, string> = {
  En_attente: 'En attente',
  Partiellement_payé: 'Partiellement payé',
  Payé: 'Payé',
  Annulé: 'Annulé',
  Impayé: 'Impayé',
};

export const ModePaiementLabels: Record<ModePaiement, string> = {
  Espèces: 'Espèces',
  Carte_bancaire: 'Carte bancaire',
  Chèque: 'Chèque',
  Virement: 'Virement',
  Prélèvement: 'Prélèvement',
  En_ligne: 'En ligne',
};

export const StatutPaiementLabels: Record<StatutPaiement, string> = {
  Effectue: 'Effectué',
  En_attente: 'En attente',
  Refusé: 'Refusé',
  Remboursé: 'Remboursé',
};

export const CategorieActeLabels: Record<CategorieActeMedical, string> = {
  Consultation: 'Consultation',
  Intervention: 'Intervention',
  Examen: 'Examen',
  Soin: 'Soin',
  Hospitalisation: 'Hospitalisation',
  Pharmacie: 'Pharmacie',
};

export const CategorieActeMedicalValues: CategorieActeMedical[] = [
  'Consultation',
  'Intervention',
  'Examen',
  'Soin',
  'Hospitalisation',
  'Pharmacie',
];

export const ModePaiementValues: ModePaiement[] = [
  'Espèces',
  'Carte_bancaire',
  'Chèque',
  'Virement',
  'Prélèvement',
  'En_ligne',
];

export const StatutFactureValues: StatutFacture[] = [
  'En_attente',
  'Partiellement_payé',
  'Payé',
  'Annulé',
  'Impayé',
];
