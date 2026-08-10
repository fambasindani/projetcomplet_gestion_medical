// types/auth.ts
export interface RegisterDto {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: 'ADMIN' | 'MEDECIN' | 'PATIENT' | 'SECRETAIRE';
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  token: string;
  tokenExpiration: string;
}

export interface User {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}