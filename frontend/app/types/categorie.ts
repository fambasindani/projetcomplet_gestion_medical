export interface Categorie {
  idCategorie: number;
  nomCategorie: string;
  description?: string;
  codeCategorie?: string;
  nombreMedicaments?: number;
}

export type CategorieCreate = Omit<Categorie, 'idCategorie' | 'nombreMedicaments'>;