// app/types/intervention.ts
export type StatutIntervention = 'Programmee' | 'En_cours' | 'Terminee' | 'Reportee' | 'Annulee';

export interface InterventionDetails {
  idIntervention: number;
  numeroIntervention: string;
  idHospitalisation: number | null;
  numeroAdmission: string | null;
  idPatient: number;
  patientNom: string | null;
  patientPrenom: string | null;
  idMedecinPrincipal: number;
  medecinPrincipalNom: string | null;
  medecinPrincipalPrenom: string | null;
  typeIntervention: string;
  descriptionPreop: string | null;
  dateIntervention: string;
  dureePrevue: number | null;
  dureeReelle: number | null;
  salleOperation: string | null;
  anesthesieType: string | null;
  idAnesthesiste: number | null;
  anesthesisteNom: string | null;
  compteRenduOperatoire: string | null;
  complications: string | null;
  resultat: string | null;
  suitesOperatoires: string | null;
  statut: StatutIntervention;
  dateAnnulation: string | null;
  motifAnnulation: string | null;
  consentementSigne: boolean | null;
  jeunRespecte: boolean | null;
  notesInfirmieres: string | null;
}
