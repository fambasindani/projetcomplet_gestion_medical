import { Chambre } from "./chambre";
import { Medecin } from "./medecin";

// types/index.ts
export interface Specialite {
  idSpecialite: number;
  nomSpecialite: string;
  description?: string;
  chefService?: string;
  telephoneService?: string;
  emailService?: string;
  dateCreation?: string;
  actif: boolean;
  medecins?: Medecin[];
  chambres?: Chambre[];
}

export interface SpecialiteCreate {
  nomSpecialite: string;
  description?: string;
  chefService?: string;
  telephoneService?: string;
  emailService?: string;
  dateCreation?: string;
  actif: boolean;
}


export interface StatistiquesSpecialites {
  totalSpecialites: number;
  specialitesActives: number;
  specialitesInactives: number;
  detailsParSpecialite: Array<{
    specialite: string;
    nombreMedecins: number;
    nombreChambres: number;
  }>;
}