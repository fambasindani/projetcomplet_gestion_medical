// types/inventaire.ts
export type TypeInventaire = 'Annuel' | 'Trimestriel' | 'Mensuel' | 'Tournant' | 'Exceptionnel';
export type StatutInventaire = 'En_cours' | 'Valide' | 'Annule';

export interface LigneInventaire {
  idLigneInventaire?: number;
  idMedicament: number;
  medicamentNom?: string;
  idLot: number;
  lotNumero?: string;
  quantiteTheorique: number;
  quantiteReelle: number;
  ecart?: number;
  raisonEcart?: string;
  prixUnitaire?: number;
  valeurEcart?: number;
}

export interface Inventaire {
  idInventaire: number;
  dateInventaire: string;
  typeInventaire: TypeInventaire;
  realisePar: number;
  realisateurNom?: string;
  validePar?: number;
  validateurNom?: string;
  dateValidation?: string;
  observations?: string;
  statut: StatutInventaire;
  lignes: LigneInventaire[];
}

export interface InventaireRequest {
  dateInventaire: string;
  typeInventaire: TypeInventaire;
  realisePar: number;
  validePar?: number;
  observations?: string;
  lignes: Omit<LigneInventaire, 'idLigneInventaire' | 'medicamentNom' | 'lotNumero' | 'ecart' | 'valeurEcart'>[];
}