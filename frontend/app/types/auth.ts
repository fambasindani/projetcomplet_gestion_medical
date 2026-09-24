// types/auth.ts
import type { UserRole } from './user';
export type { UserRole };

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  medecinId?: number | null;
  token: string;
  refreshToken: string;
  expiresIn: number;
  permissions?: string[];
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: UserRole;
  medecinId?: number | null;
  permissions?: string[];
}