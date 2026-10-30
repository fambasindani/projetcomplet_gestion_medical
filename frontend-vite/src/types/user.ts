export type UserRole =
  | 'ADMIN'
  | 'MEDECIN'
  | 'PATIENT'
  | 'SECRETAIRE'
  | 'PHARMACIEN'
  | 'INFIRMIER'
  | 'LABORANTIN'
  | 'RH';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  actif: boolean;
  personnelId: number | null;
  permissions?: string[];
  dateCreation: string;
  dateModification: string;
}

export interface UserCreate {
  personnelId: number;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface UserUpdate {
  id: number;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
  confirmPassword?: string;
  personnelId?: number;
}

export interface PersonnelSimple {
  idPersonnel: number;
  nom: string;
  prenom: string;
  email: string;
  fonction: string;
}