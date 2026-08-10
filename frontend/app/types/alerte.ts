export type TypeAlerteStock =
  | 'STOCK_FAIBLE'
  | 'STOCK_CRITIQUE'
  | 'PEREMPTION_PROCHAINE'
  | 'PEREMPTION_DEPASSEE';

export interface AlerteStock {
  idAlerte: number;
  idMedicament: number;
  medicamentNom: string;
  typeAlerte: TypeAlerteStock;
  seuilActuel: number | null;
  seuilMinimum: number | null;
  datePeremption: string | null;
  dateAlerte: string;
  traitee: boolean;                // ✅ nouveau
  dateTraitement: string | null;   // ✅ nouveau
  traiteePar: number | null;       // ✅ nouveau
  traiteurNom: string | null;      // ✅ nouveau
  actionEntreprise: string | null; // ✅ nouveau
}

// Pour la création
export interface AlerteStockRequest {
  idMedicament: number;
  typeAlerte: TypeAlerteStock;
  seuilActuel?: number | null;
  seuilMinimum?: number | null;
  datePeremption?: string | null;
  traitee?: boolean;
  traiteePar?: number | null;
  actionEntreprise?: string | null;
}

// Pour le traitement (PATCH)
export interface AlerteStockUpdate {
  traitee?: boolean;
  traiteePar?: number | null;
  actionEntreprise?: string | null;
}