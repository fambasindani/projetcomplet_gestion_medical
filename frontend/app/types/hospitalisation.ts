export enum StatutHospitalisation {
  En_cours = 'En_cours',
  Terminee = 'Terminée',
  Transfere = 'Transféré',
  Decede = 'Décédé',
  Sortie_contre_avis = 'Sortie_contre_avis'
}

export enum ModeEntreeHospitalisation {
  Urgences = 'Urgences',
  Consultation = 'Consultation',
  Programmee = 'Programmée',
  Transfert = 'Transfert'
}

export enum ModeSortieHospitalisation {
  Domicile = 'Domicile',
  Transfert = 'Transfert',
  Deces = 'Décès'
}

export interface Hospitalisation {
  idHospitalisation: number;
  numeroAdmission: string;
  idPatient: number;
  patientNom: string;
  patientPrenom: string;
  idChambre: number | null;
  chambreNumero: string | null;
  idMedecinResponsable: number;
  medecinNom: string;
  medecinPrenom: string;
  dateAdmission: string;
  dateSortie: string | null;
  motifAdmission: string;
  modeEntree: ModeEntreeHospitalisation;
  provenance: string | null;
  diagnosticPrincipal: string | null;
  traitementsEnCours: string | null;
  examensRealises: string | null;
  regimeAlimentaire: string | null;
  consignesParticulieres: string | null;
  statut: StatutHospitalisation;
  notesSortie: string | null;
  modeSortie: ModeSortieHospitalisation | null;
  destinationSortie: string | null;
  dateCreation: string;
}

export type HospitalisationCreate = Omit<Hospitalisation,
  'idHospitalisation' | 'idPatient' | 'idMedecinResponsable' | 'patientNom' | 'patientPrenom' | 'chambreNumero' | 'medecinNom' | 'medecinPrenom' | 'dateCreation'
> & {
  idPatient?: number | null;
  idMedecinResponsable?: number | null;
};