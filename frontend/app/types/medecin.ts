// types/medecin.ts

import { Specialite } from "./specialite";

export interface Medecin {
  idMedecin: number;
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  lieuNaissance?: string | null;
  genre: 'M' | 'F';   // ← chaîne
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  idSpecialite?: number | null;
  nomSpecialite?: string;
  qualification?: string | null;
  diplome?: string | null;
  numeroOrdre?: string | null;
  dateEmbauche?: string | null;
  salaire?: number | null;
  disponibilite: 'Disponible' | 'EnConge' | 'Absent' | 'EnFormation'; // ← chaîne
  photo?: string | null;
  notes?: string | null;
  dateCreation: string;
  specialite?: Specialite | null;
}

export interface MedecinCreate {
  matricule: string;
  nom: string;
  prenom: string;
  dateNaissance?: string | null;
  lieuNaissance?: string | null;
  genre: 'M' | 'F';
  telephone?: string | null;
  email?: string | null;
  adresse?: string | null;
  idSpecialite?: number | null;
  qualification?: string | null;
  diplome?: string | null;
  numeroOrdre?: string | null;
  dateEmbauche?: string | null;
  salaire?: number | null;
  disponibilite: 'Disponible' | 'EnConge' | 'Absent' | 'EnFormation';
  photo?: string | null;
  notes?: string | null;
}

export interface MedecinStats {
  resume: {
    totalMedecins: number;
    medecinsActifs: number;
    tauxActivite: number;
    medecinsRecents: number;
  };
  parSpecialite: {
    specialite: string;
    nombreMedecins: number;
    disponibles: number;
    enConge: number;
    absents: number;
    enFormation: number;
  }[];
  parDisponibilite: {
    disponibilite: string;
    nombre: number;
    pourcentage: number;
  }[];
  topMedecins: {
    nom: string;
    prenom: string;
    matricule: string;
    specialite: string;
    disponibilite: string;
    nombreConsultations: number;
    photo?: string | null;
  }[];
}

export interface MedecinDetails {
  informationsPersonnelles?: {
    nom: string;
    prenom: string;
    matricule: string;
    photo?: string | null;
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    genre?: string;
    dateNaissance?: string | null;
  } | null;
  informationsProfessionnelles?: {
    specialite?: string;
    qualification?: string | null;
    diplome?: string | null;
    salaire?: number | null;
    disponibilite?: string;
  } | null;
  statistiques?: {
    totalConsultations: number;
    totalRendezVous: number;
    rendezVousAVenir: number;
  } | null;
  rendezVousAVenir?: {
    idRdv: number;
    dateRdv: string;
    patient: string;
    statut: string;
  }[];
}