// app/types/dossierMedical.ts

export interface ConsultationResume {
  idConsultation: number;
  dateConsultation: string;
  motif: string;
  diagnostic: string | null;
  medecinNom: string;
  medecinPrenom: string;
}

export interface PrescriptionResume {
  idPrescription: number;
  datePrescription: string;
  type: string; // "Médicament", "Examen", "Soin", "Rééducation", "Régime"
  description: string;
  instructions: string | null;
  statut: string;
}

export interface ExamenResume {
  idExamen: number;
  typeExamen: string;
  dateRealisation: string | null;
  resultat: string | null;
  conclusion: string | null;
  statut: string;
}

export interface HospitalisationResume {
  idHospitalisation: number;
  numeroAdmission: string;
  dateAdmission: string;
  dateSortie: string | null;
  motifAdmission: string;
  diagnosticPrincipal: string | null;
  statut: string;
  modeSortie: string | null;
}

export interface InterventionResume {
  idIntervention: number;
  typeIntervention: string;
  dateIntervention: string;
  chirurgienPrincipal: string;
  anesthesieType: string | null;
  resultat: string | null;
}

export interface DossierMedical {
  idPatient: number;
  nom: string;
  prenom: string;
  dateNaissance: string;
  genre: string;
  groupeSanguin: string | null;
  allergies: string | null;
  antecedentsMedicaux: string | null;
  antecedentsChirurgicaux: string | null;
  traitementHabituel: string | null;
  mutuelle: string | null;
  consultations: ConsultationResume[];
  prescriptions: PrescriptionResume[];
  examens: ExamenResume[];
  hospitalisations: HospitalisationResume[];
  interventions: InterventionResume[];
}