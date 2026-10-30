export enum StatutRendezVous {
  Programme = 'Programmé',
  Confirme = 'Confirmé',
  Annule = 'Annulé',
  Termine = 'Terminé',
  NonPresente = 'Non_présenté'
}

export interface RendezVous {
  idRdv: number;
  idPatient: number;
  patientNom: string;
  patientPrenom: string;
  idMedecin: number;
  medecinNom: string;
  medecinPrenom: string;
  medecinSpecialite?: string;
  dateRdv: string;         // format ISO avec secondes
  motif?: string;
  statut: StatutRendezVous;
  typeConsultation?: string;
  dureeEstimee?: number;
  notesPreliminaires?: string;
  dateAnnulation?: string;
  motifAnnulation?: string;
  rappelEnvoye?: boolean;
}

export type RendezVousCreate = Omit<RendezVous, 'idRdv' | 'idPatient' | 'idMedecin' | 'patientNom' | 'patientPrenom' | 'medecinNom' | 'medecinPrenom' | 'medecinSpecialite' | 'dateAnnulation' | 'motifAnnulation'> & {
  idPatient?: number | null;
  idMedecin?: number | null;
};