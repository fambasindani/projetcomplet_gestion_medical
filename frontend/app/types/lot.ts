export enum StatutLot {
  Disponible = 'Disponible',
  Rupture = 'Rupture',
  Perime = 'Périmé',
  Retire = 'Retiré'
}

export interface LotMedicament {
  idLot: number;
  idMedicament: number;
  medicamentNom?: string;
  numeroLot: string;
  idFournisseur: number | null;
  fournisseurNom?: string;
  dateFabrication: string | null;
  datePeremption: string;
  quantiteInitial: number;
  quantiteRestante: number;
  prixAchatUnitaire: number | null;
  prixVenteUnitaire: number | null;
  emplacementStockage: string | null;
  dateReception: string | null;
  bonCommande: string | null;
  factureFournisseur: string | null;
  controleQualite: boolean;
  statut: StatutLot;
  notes: string | null;
}

export type LotCreate = Omit<LotMedicament, 'idLot' | 'medicamentNom' | 'fournisseurNom'>;