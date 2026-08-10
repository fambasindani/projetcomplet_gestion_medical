export type MotifDelivrance = 'SUR_ORDONNANCE' | 'URGENCE' | 'GRATUITE';

export interface DetailDelivranceResponse {
  idDetailDelivrance: number;
  idMedicament: number;
  medicamentNom: string;
  idLot: number;
  lotNumero: string;
  quantiteDelivree: number;
  prixUnitaire: number;
  montantLigne: number;
  priseEnChargeMutuelle: number;
  resteACharge: number;
}

export interface DelivranceResponse {
  idDelivrance: number;
  numeroOrdonnance: string;
  idPatient: number;
  patientNom: string;
  idMedecinPrescripteur: number | null;
  medecinNom: string | null;
  idPrescriptionMed: number | null;
  dateDelivrance: string;
  idPharmacien: number;
  pharmacienNom: string;
  motifDelivrance: MotifDelivrance;
  observations: string | null;
  signatureElectronique: boolean;
  details: DetailDelivranceResponse[];
}

export interface DelivranceUpdateRequest {
  numeroOrdonnance?: string;
  idPatient: number;
  idMedecinPrescripteur?: number | null;
  idPrescriptionMed?: number | null;
  motifDelivrance: MotifDelivrance;
  observations?: string;
  signatureElectronique?: boolean;
  details: DetailDelivranceRequest[];
}


// types/delivrance.ts
export interface DelivranceStatistiques {
  totalDelivrances: number;
  delivrancesCeMois: number;
  montantTotal: number;
  topMedicaments: Array<{
    idMedicament: number;
    nom: string;
    quantiteTotale: number;
  }>;
}

export interface DetailDelivranceRequest {
  idMedicament: number;
  idLot: number;
  quantiteDelivree: number;
  prixUnitaire: number;
  priseEnChargeMutuelle?: number;
}

export interface DelivranceRequest {
  numeroOrdonnance?: string;
  idPatient: number;
  idMedecinPrescripteur?: number | null;
  idPrescriptionMed?: number | null;
  motifDelivrance: MotifDelivrance;
  observations?: string;
  signatureElectronique?: boolean;
  details: DetailDelivranceRequest[];
}