export type Genre = 'M' | 'F';
export type TypeContrat = 'CDI' | 'CDD' | 'Stage' | 'Interim';

export interface PersonnelResponse {
  idPersonnel: number;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance: string | null;
  genre: Genre;
  fonction: string;
  service: string | null;
  telephone: string | null;
  email: string | null;
  adresse: string | null;
  dateEmbauche: string | null;
  salaire: number | null;
  typeContrat: TypeContrat | null;
  photo: string | null;
}

export interface PersonnelRequest {
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  genre: Genre;
  fonction: string;
  service?: string | null;
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  dateEmbauche?: string | null;
  salaire?: number | null;
  typeContrat?: TypeContrat | null;
  photo?: string | null;
}

export interface PersonnelUpdate extends PersonnelRequest {
  idPersonnel: number;
}

export const GenreLabels: Record<Genre, string> = {
  M: 'Masculin',
  F: 'Féminin',
};

export const TypeContratLabels: Record<TypeContrat, string> = {
  CDI: 'CDI',
  CDD: 'CDD',
  Stage: 'Stage',
  Interim: 'Interim',
};