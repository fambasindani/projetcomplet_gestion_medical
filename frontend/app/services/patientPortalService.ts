import api from './api';

export interface MonRdv {
  idRdv: number;
  dateRdv: string;
  statut: string;
  motif: string | null;
  medecinNom: string | null;
  medecinSpecialite: string | null;
}

export interface MonExamen {
  idExamen: number;
  numeroExamen: string;
  typeExamen: string;
  statut: string;
  datePrescription: string;
  dateRealisation: string | null;
  laboratoire: string | null;
  resultat: string | null;
  interpretation: string | null;
  compteRendu: string | null;
  conclusion: string | null;
}

export interface MonOrdonnance {
  idPrescription: number;
  numeroPrescription: string;
  datePrescription: string;
  typePrescription: string;
  statut: string;
  description: string | null;
  instructions: string | null;
  medecinNom: string | null;
}

export interface MaConsultation {
  idConsultation: number;
  dateConsultation: string;
  motifConsultation: string | null;
  diagnostic: string | null;
  observations: string | null;
  medecinNom: string | null;
}

export interface MaFacture {
  idFacture: number;
  numeroFacture: string;
  dateEmission: string;
  dateEcheance: string | null;
  montantHt: number;
  montantTtc: number;
  montantPaye: number;
  montantRestant: number;
  statut: string;
  resteAChargePatient: number | null;
  details: { description: string; quantite: number; prixUnitaire: number; montantHt: number }[];
}

export interface MonDossier {
  informations: Record<string, unknown>;
  constantes: {
    dateMesure: string;
    temperature: number | null;
    pouls: number | null;
    pressionSystolique: number | null;
    pressionDiastolique: number | null;
    saturation: number | null;
    frequenceRespiratoire: number | null;
    glycemie: number | null;
    observations: string | null;
  }[];
}

export interface MedecinPortail {
  idMedecin: number;
  nom: string;
  prenom: string;
  specialite: string | null;
}

export const patientPortalService = {
  async getDossier(): Promise<MonDossier> {
    const res = await api.get<MonDossier>('/patient-portail/dossier');
    return res.data;
  },
  async getMedecins(): Promise<MedecinPortail[]> {
    const res = await api.get<MedecinPortail[]>('/patient-portail/medecins');
    return res.data;
  },
  async getRendezVous(): Promise<MonRdv[]> {
    const res = await api.get<MonRdv[]>('/patient-portail/rendez-vous');
    return res.data;
  },
  async demanderRendezVous(data: { dateRdv: string; idMedecin: number; motif?: string }): Promise<MonRdv> {
    const res = await api.post<MonRdv>('/patient-portail/rendez-vous', data);
    return res.data;
  },
  async annulerRendezVous(id: number): Promise<MonRdv> {
    const res = await api.patch<MonRdv>(`/patient-portail/rendez-vous/${id}/annuler`, {});
    return res.data;
  },
  async getExamens(): Promise<MonExamen[]> {
    const res = await api.get<MonExamen[]>('/patient-portail/examens');
    return res.data;
  },
  async getOrdonnances(): Promise<MonOrdonnance[]> {
    const res = await api.get<MonOrdonnance[]>('/patient-portail/ordonnances');
    return res.data;
  },
  async getConsultations(): Promise<MaConsultation[]> {
    const res = await api.get<MaConsultation[]>('/patient-portail/consultations');
    return res.data;
  },
  async getFactures(): Promise<MaFacture[]> {
    const res = await api.get<MaFacture[]>('/patient-portail/factures');
    return res.data;
  },
};
