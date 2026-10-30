export interface Medicament {
  idMedicament: number;
  codeCip: string;
  codeCis: string | null;
  nomCommercial: string;
  denominationCommune: string | null;
  formePharmaceutique: string | null;
  dosage: string | null;
  presentation: string | null;
  voieAdministration: string | null; // ← important pour l'affichage
 idCategorie: number | null;
  nomCategorie: string | null; 
  laboratoire: string | null;
  substanceActive: string | null;
  excipients: string | null;
  indications: string | null;
  contreIndications: string | null;
  effetsSecondaires: string | null;
  precautionsEmploi: string | null;
  conservationConditions: string | null;
  temperatureConservation: string | null;
  dureeConservationMois: number | null;
  prescriptionObligatoire: boolean;
  listePsychotrope: boolean;
  generique: boolean;
  idGeneriqueParent: number | null;
  generiqueParentNom?: string;
  prixAchat: number | null;
  prixVente: number | null;
  tauxRemboursement: number | null;
  stockMinimum: number;
  stockMaximum: number;
  datePeremptionAlerte: number;
  actif: boolean;
  dateCreation: string;
}

export type MedicamentCreate = Omit<Medicament, 'idMedicament' | 'nomCategorie' | 'generiqueParentNom' | 'dateCreation'>;