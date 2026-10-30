export interface SigneVital {
  idSigneVital: number;
  idPatient: number;
  patientNom: string | null;
  patientPrenom: string | null;
  idPersonnel: number | null;
  prisePar: string | null;
  dateMesure: string;
  poids: number | null;
  taille: number | null;
  imc: number | null;
  temperature: number | null;
  pouls: number | null;
  pressionSystolique: number | null;
  pressionDiastolique: number | null;
  saturation: number | null;
  frequenceRespiratoire: number | null;
  glycemie: number | null;
  douleurEchelle: number | null;
  observations: string | null;
}

export type SigneVitalCreate = Omit<
  SigneVital,
  'idSigneVital' | 'patientNom' | 'patientPrenom' | 'imc'
>;
