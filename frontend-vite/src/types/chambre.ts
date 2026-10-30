export interface Chambre {
  idChambre: number;
  numeroChambre: string;
  telephone: boolean;
  television: boolean;
  wifi: boolean;
  salleBainPrivee: boolean;
  accessibiliteHandicape: boolean;
  etage: number | null;
  batiment: string | null;
  typeChambre: TypeChambre;
  statut: StatutChambre;
  prixJour: number | null;
  idSpecialite: number | null;
  nomSpecialite: string | null;
  equipements: string | null;
  notes: string | null;
  nombreHospitalisations: number;




 
}


export enum TypeChambre {
  Individuelle = 'Individuelle',
  Double = 'Double',
  Triple = 'Triple',
  Suite = 'Suite',
  Soins_intensifs = 'Soins_intensifs'
}

export enum StatutChambre {
  Disponible = 'Disponible',
  Occupee = 'Occupee',
  En_nettoyage = 'En_nettoyage',
  Hors_service = 'Hors_service',
  Reservee = 'Reservee'
}



export type ChambreCreate = Omit<Chambre, 'idChambre' | 'nomSpecialite' | 'nombreHospitalisations'>;