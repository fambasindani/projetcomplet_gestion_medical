export type UserRole = 'ADMIN' | 'PHARMACIEN' | 'MEDECIN' | 'SECRETAIRE';

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  actif: boolean;
  personnelId: number | null;
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