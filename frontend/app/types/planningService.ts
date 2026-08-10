// app/types/planning.ts

export interface RendezVous {
  idRdv: number;
  dateRdv: string;
  motif: string;
  statut: string;
  typeConsultation: string;
  dureeEstimee: number;
  idPatient: number;
  patientNom: string;
  patientPrenom: string;
  idConsultation: number | null;
}

export interface PlanningStats {
  aujourdhui: number;
}