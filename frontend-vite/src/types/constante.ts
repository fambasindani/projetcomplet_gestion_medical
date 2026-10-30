export interface Constante {
  idConstante: number;
  idHospitalisation: number;
  hospitalisationNumero: string | null;
  dateMesure: string;
  temperature: number | null;
  pouls: number | null;
  pressionSystolique: number | null;
  pressionDiastolique: number | null;
  saturation: number | null;
  frequenceRespiratoire: number | null;
  glycemie: number | null;
  douleurEchelle: number | null;
  prisePar: string | null;
  observations: string | null;
}

export type ConstanteCreate = Omit<Constante, 'idConstante' | 'hospitalisationNumero'>;