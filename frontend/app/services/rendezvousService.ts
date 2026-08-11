// app/services/rendezvousService.ts
import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { RendezVous, RendezVousCreate, StatutRendezVous } from '@/app/types/rendezvous';

interface RendezVousCreatePayload {
  idPatient: number;
  idMedecin: number;
  dateRdv: string;
  motif: string | null;
  statut: StatutRendezVous;
  typeConsultation: string | null;
  dureeEstimee: number | null;
  notesPreliminaires: string | null;
  rappelEnvoye: boolean;
}

type RendezVousUpdatePayload = Partial<RendezVousCreatePayload>;

interface PlanningJournalierParams {
  date: string;
  idMedecin?: number;
}

/**
 * Convertit une chaîne "YYYY-MM-DDThh:mm" (datetime-local) en "YYYY-MM-DDThh:mm:ss"
 * et ajoute 2 minutes de marge pour éviter l'erreur @Future.
 */
const formatDateForBackend = (dateStr: string): string => {
  if (!dateStr) return '';
  const localDate = new Date(dateStr);
  if (isNaN(localDate.getTime())) return '';
  // Ajouter 2 minutes pour être sûr que la date est dans le futur
  localDate.setMinutes(localDate.getMinutes() + 2);
  // Formater en "YYYY-MM-DDThh:mm:ss" (sans fuseau)
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  const seconds = String(localDate.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

const formatDateObjectForBackend = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const rendezvousService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<RendezVous>> {
    const res = await api.get<PagedResult<RendezVous>>('/rendezvous', { params: { pageIndex, pageSize } });
    return res.data;
  },

  async getByPatient(patientId: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<RendezVous>> {
    const res = await api.get<PagedResult<RendezVous>>(`/rendezvous/patient/${patientId}`, { params: { pageIndex, pageSize } });
    return res.data;
  },

  async getByMedecin(medecinId: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<RendezVous>> {
    const res = await api.get<PagedResult<RendezVous>>(`/rendezvous/medecin/${medecinId}`, { params: { pageIndex, pageSize } });
    return res.data;
  },

  async getByStatut(statut: StatutRendezVous, pageIndex = 1, pageSize = 10): Promise<PagedResult<RendezVous>> {
    const res = await api.get<PagedResult<RendezVous>>(`/rendezvous/statut/${statut}`, { params: { pageIndex, pageSize } });
    return res.data;
  },

  async getById(id: number): Promise<RendezVous> {
    const res = await api.get<RendezVous>(`/rendezvous/${id}`);
    return res.data;
  },

  async create(data: RendezVousCreate): Promise<RendezVous> {
    const payload: RendezVousCreatePayload = {
      idPatient: Number(data.idPatient),
      idMedecin: Number(data.idMedecin),
      dateRdv: formatDateForBackend(data.dateRdv),
      motif: data.motif || null,
      statut: data.statut,
      typeConsultation: data.typeConsultation || null,
      dureeEstimee: data.dureeEstimee ? Number(data.dureeEstimee) : null,
      notesPreliminaires: data.notesPreliminaires || null,
      rappelEnvoye: data.rappelEnvoye ?? false,
    };
    const res = await api.post<RendezVous>('/rendezvous', payload);
    return res.data;
  },

  async update(id: number, data: Partial<RendezVousCreate>): Promise<RendezVous> {
    const payload: RendezVousUpdatePayload = {};
    if (data.idPatient !== undefined) payload.idPatient = Number(data.idPatient);
    if (data.idMedecin !== undefined) payload.idMedecin = Number(data.idMedecin);
    if (data.dateRdv !== undefined) payload.dateRdv = formatDateForBackend(data.dateRdv);
    if (data.motif !== undefined) payload.motif = data.motif || null;
    if (data.statut !== undefined) payload.statut = data.statut;
    if (data.typeConsultation !== undefined) payload.typeConsultation = data.typeConsultation || null;
    if (data.dureeEstimee !== undefined) payload.dureeEstimee = data.dureeEstimee ? Number(data.dureeEstimee) : null;
    if (data.notesPreliminaires !== undefined) payload.notesPreliminaires = data.notesPreliminaires || null;
    if (data.rappelEnvoye !== undefined) payload.rappelEnvoye = data.rappelEnvoye;
    const res = await api.put<RendezVous>(`/rendezvous/${id}`, payload);
    return res.data;
  },

  async annuler(id: number, motif: string): Promise<void> {
    await api.patch(`/rendezvous/${id}/annuler`, null, { params: { motif } });
  },

  async changerStatut(id: number, statut: StatutRendezVous): Promise<void> {
    await api.patch(`/rendezvous/${id}/statut`, null, { params: { statut } });
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/rendezvous/${id}`);
  },

  async getPlanningJournalier(date: Date, medecinId?: number): Promise<RendezVous[]> {
    const params: PlanningJournalierParams = { date: formatDateObjectForBackend(date) };
    if (medecinId !== undefined) params.idMedecin = medecinId;
    const res = await api.get<RendezVous[]>('/rendezvous/planning/journalier', { params });
    return res.data;
  },
};