// src/types/patient.ts

export type Genre = 'M' | 'F'; // 'M' = Masculin, 'F' = Féminin
export type GroupeSanguin = 'A_plus' | 'A_minus' | 'B_plus' | 'B_minus' | 'AB_plus' | 'AB_minus' | 'O_plus' | 'O_minus';
export type SituationFamiliale = 'Célibataire' | 'Marié_e' | 'Divorcé_e' | 'Veuf_ve';

export interface Patient {
  idPatient: number;
  numeroSecuriteSociale: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string | null;
  genre: Genre;
  telephone?: string | null;
  telephoneUrgent?: string | null;
  email?: string | null;
  adresse?: string | null;
  profession?: string | null;
  situationFamiliale?: SituationFamiliale | null;
  groupeSanguin?: GroupeSanguin | null;
  allergies?: string | null;
  antecedentsMedicaux?: string | null;
  antecedentsChirurgicaux?: string | null;
  traitementHabituel?: string | null;
  mutuelle?: string | null;
  numeroMutuelle?: string | null;
  personneContactNom?: string | null;
  personneContactLien?: string | null;
  personneContactTelephone?: string | null;
  dateEnregistrement: string;
  consentement: boolean;
}

export interface PatientCreate {
  numeroSecuriteSociale: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string | null;
  genre: Genre;
  telephone?: string | null;
  telephoneUrgent?: string | null;
  email?: string | null;
  adresse?: string | null;
  profession?: string | null;
  situationFamiliale?: SituationFamiliale | null;
  groupeSanguin?: GroupeSanguin | null;
  allergies?: string | null;
  antecedentsMedicaux?: string | null;
  antecedentsChirurgicaux?: string | null;
  traitementHabituel?: string | null;
  mutuelle?: string | null;
  numeroMutuelle?: string | null;
  personneContactNom?: string | null;
  personneContactLien?: string | null;
  personneContactTelephone?: string | null;
  consentement?: boolean;
}

export interface PatientUpdate {
  idPatient: number;
  numeroSecuriteSociale: string;
  nom: string;
  prenom: string;
  dateNaissance: string;
  lieuNaissance?: string | null;
  genre: Genre;
  telephone?: string | null;
  telephoneUrgent?: string | null;
  email?: string | null;
  adresse?: string | null;
  profession?: string | null;
  situationFamiliale?: SituationFamiliale | null;
  groupeSanguin?: GroupeSanguin | null;
  allergies?: string | null;
  antecedentsMedicaux?: string | null;
  antecedentsChirurgicaux?: string | null;
  traitementHabituel?: string | null;
  mutuelle?: string | null;
  numeroMutuelle?: string | null;
  personneContactNom?: string | null;
  personneContactLien?: string | null;
  personneContactTelephone?: string | null;
  consentement: boolean;
}

export interface PatientStats {
  totalPatients: number;
  patientsRecents: number;
  parGenre: Array<{ genre: string; nombre: number }>;
  parGroupeSanguin: Array<{ groupeSanguin: string; nombre: number }>;
  parSituationFamiliale: Array<{ situationFamiliale: string; nombre: number }>;
}

export interface PatientDetails {
  informationsPersonnelles: {
    idPatient: number;
    numeroSecuriteSociale: string;
    nom: string;
    prenom: string;
    dateNaissance: string;
    lieuNaissance: string | null;
    genre: string;
    telephone: string | null;
    telephoneUrgent: string | null;
    email: string | null;
    adresse: string | null;
    profession: string | null;
    situationFamiliale: string | null;
    groupeSanguin: string | null;
    allergies: string | null;
    antecedentsMedicaux: string | null;
    antecedentsChirurgicaux: string | null;
    traitementHabituel: string | null;
    mutuelle: string | null;
    numeroMutuelle: string | null;
    personneContactNom: string | null;
    personneContactLien: string | null;
    personneContactTelephone: string | null;
    dateEnregistrement: string;
    consentement: boolean;
  };
  rendezVous: Array<{
    idRdv: number;
    dateRdv: string;
    motif: string | null;
    statut: string;
  }>;
  consultations: Array<{
    idConsultation: number;
    dateConsultation: string;
    motifConsultation: string | null;
    diagnostic: string | null;
  }>;
  hospitalisations: Array<{
    idHospitalisation: number;
    dateAdmission: string;
    dateSortie: string | null;
    motif: string | null;
    statut: string;
  }>;
}

export const GenreLabels: Record<Genre, string> = {
  M: 'Masculin',
  F: 'Féminin',
};

export const GroupeSanguinLabels: Record<GroupeSanguin, string> = {
  A_plus: 'A+',
  A_minus: 'A-',
  B_plus: 'B+',
  B_minus: 'B-',
  AB_plus: 'AB+',
  AB_minus: 'AB-',
  O_plus: 'O+',
  O_minus: 'O-',
};

export const SituationFamilialeLabels: Record<SituationFamiliale, string> = {
  Célibataire: 'Célibataire',
  Marié_e: 'Marié(e)',
  Divorcé_e: 'Divorcé(e)',
  Veuf_ve: 'Veuf/veuve',
};