export interface Fournisseur {
  idFournisseur: number;
  nomFournisseur: string;
  contactNom: string | null;
  contactFonction: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  siteWeb: string | null;
  siret: string | null;
  numeroAgrement: string | null;
  conditionsPaiement: string | null;
  delaiLivraison: number | null;
  note: number | null;
  actif: boolean;
}

export type FournisseurCreate = Omit<Fournisseur, 'idFournisseur'>;