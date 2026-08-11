import api from './api';
import { PagedResult } from '@/app/types/pagination';
import {
  AdmissionUrgence,
  AdmissionUrgenceCreate,
  GraviteUrgence,
  InterventionUrgence,
  InterventionUrgenceCreate,
  StatutAdmissionUrgence,
  StatutInterventionUrgence,
} from '@/app/types/urgence';
import { toIsoStartOfDay, toIsoEndOfDay } from '@/app/utils/dateRange';

export const urgenceService = {
  // ---- Admissions ----
  async getAdmissions(
    filters: {
      statut?: StatutAdmissionUrgence;
      gravite?: GraviteUrgence;
      idPatient?: number;
      dateStart?: string;
      dateEnd?: string;
    } = {},
    pageIndex = 1,
    pageSize = 10,
  ): Promise<PagedResult<AdmissionUrgence>> {
    const res = await api.get('/urgences/admissions', {
      params: { ...filters, dateStart: toIsoStartOfDay(filters.dateStart), dateEnd: toIsoEndOfDay(filters.dateEnd), pageIndex, pageSize },
    });
    return res.data;
  },

  async getSalleAttente(): Promise<AdmissionUrgence[]> {
    const res = await api.get('/urgences/admissions/salle-attente');
    return res.data;
  },

  async getAdmissionById(id: number): Promise<AdmissionUrgence> {
    const res = await api.get(`/urgences/admissions/${id}`);
    return res.data;
  },

  async createAdmission(data: AdmissionUrgenceCreate): Promise<AdmissionUrgence> {
    const res = await api.post('/urgences/admissions', data);
    return res.data;
  },

  async updateAdmission(id: number, data: Partial<AdmissionUrgenceCreate>): Promise<AdmissionUrgence> {
    const res = await api.put(`/urgences/admissions/${id}`, data);
    return res.data;
  },

  async changerStatutAdmission(id: number, statut: StatutAdmissionUrgence): Promise<AdmissionUrgence> {
    const res = await api.patch(`/urgences/admissions/${id}/statut`, null, { params: { statut } });
    return res.data;
  },

  async deleteAdmission(id: number): Promise<void> {
    await api.delete(`/urgences/admissions/${id}`);
  },

  // ---- Interventions ----
  async getInterventions(
    filters: {
      statut?: StatutInterventionUrgence;
      idPatient?: number;
      idMedecin?: number;
      dateStart?: string;
      dateEnd?: string;
    } = {},
    pageIndex = 1,
    pageSize = 10,
  ): Promise<PagedResult<InterventionUrgence>> {
    const res = await api.get('/urgences/interventions', {
      params: { ...filters, dateStart: toIsoStartOfDay(filters.dateStart), dateEnd: toIsoEndOfDay(filters.dateEnd), pageIndex, pageSize },
    });
    return res.data;
  },

  async getInterventionById(id: number): Promise<InterventionUrgence> {
    const res = await api.get(`/urgences/interventions/${id}`);
    return res.data;
  },

  async getInterventionsByAdmission(idAdmission: number): Promise<InterventionUrgence[]> {
    const res = await api.get(`/urgences/interventions/admission/${idAdmission}`);
    return res.data;
  },

  async createIntervention(data: InterventionUrgenceCreate): Promise<InterventionUrgence> {
    const res = await api.post('/urgences/interventions', data);
    return res.data;
  },

  async updateIntervention(id: number, data: Partial<InterventionUrgenceCreate>): Promise<InterventionUrgence> {
    const res = await api.put(`/urgences/interventions/${id}`, data);
    return res.data;
  },

  async changerStatutIntervention(id: number, statut: StatutInterventionUrgence): Promise<InterventionUrgence> {
    const res = await api.patch(`/urgences/interventions/${id}/statut`, null, { params: { statut } });
    return res.data;
  },

  async deleteIntervention(id: number): Promise<void> {
    await api.delete(`/urgences/interventions/${id}`);
  },
};
