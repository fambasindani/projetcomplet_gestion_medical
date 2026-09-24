// app/types/consultation.ts
export interface Consultation {
  idConsultation: number;
  idRdv: number | null;
  idPatient: number;
  patientNom: string;
  patientPrenom: string;
  idMedecin: number;
  medecinNom: string;
  medecinPrenom: string;
  idActeCatalogue: number | null;
  libelleActeCatalogue: string | null;
  prixActeCatalogue: number | null;
  dateConsultation: string;
  motifConsultation: string;
  histoireMaladie: string | null;
  diagnostic: string | null;
  traitementPrescris: string | null;
  observations: string | null;
  temperature: number | null;
  pouls: number | null;
  pressionSystolique: number | null;
  pressionDiastolique: number | null;
  saturation: number | null;
  glycemie: number | null;
  poids: number | null;
  taille: number | null;
  imc: number | null;
  certificatMedical: string | null;
  arretTravailDebut: string | null;
  arretTravailFin: string | null;
  evolution: string | null; // Favorable, Stationnaire, Defavorable
  prochainRdv: string | null;
  notesConfidentielles: string | null;
}

export type ConsultationCreate = Omit<
  Consultation,
  'idConsultation' | 'patientNom' | 'patientPrenom' | 'medecinNom' | 'medecinPrenom' | 'imc' | 'libelleActeCatalogue' | 'prixActeCatalogue'
>;

export interface ConsultationStatsData {
  totalConsultations: number;
  consultationsMois: number;
  medecinsActifs: number;
  topMedecins: {
    nom: string;
    prenom: string;
    nombreConsultations: number;
  }[];
  parMois: {
    mois: string;
    nombre: number;
  }[];
}