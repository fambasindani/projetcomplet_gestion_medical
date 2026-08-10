

export enum StatutCommandeFournisseur {
  En_attente = 'En_attente',
  Confirmee = 'Confirmee',           // ← sans accent
  Expediee = 'Expediee',             // ← sans accent
  Recue_partiellement = 'Recue_partiellement',
  Recue_completement = 'Recue_completement',
  Annulee = 'Annulee'                // ← sans accent
}

export interface DetailCommande {
  idMedicament: number;
  medicamentNom?: string;
  quantiteCommandee: number;
  quantiteRecue?: number;
  prixUnitaire: number;
  remise?: number;
  totalLigne?: number;
}

export interface CommandeFournisseur {
  idCommande: number;
  numeroCommande: string;
  idFournisseur: number;
  fournisseurNom?: string;
  dateCommande: string;
  dateLivraisonPrevue: string | null;
  dateLivraisonReelle: string | null;
  statut: StatutCommandeFournisseur;
  montantTotal: number | null;
  modePaiement: string | null;
  paiementEffectue: boolean;
  notes: string | null;
  commandePar: number | null;
  commandeurNom?: string;
  details: DetailCommande[];
}

export type CommandeCreate = Omit<CommandeFournisseur, 'idCommande' | 'fournisseurNom' | 'commandeurNom' | 'dateCommande'>;