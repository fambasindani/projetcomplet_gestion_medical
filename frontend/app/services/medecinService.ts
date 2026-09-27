// app/services/medecinService.ts
import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Medecin, MedecinCreate, MedecinDetails, MedecinStats } from '@/app/types/medecin';

export const medecinService = {
  async getAll(pageIndex: number | { pageIndex?: number; pageSize?: number; disponibilite?: string } = 1, pageSize = 10): Promise<PagedResult<Medecin>> {
    const resolved = typeof pageIndex === 'object'
      ? { pageIndex: pageIndex.pageIndex ?? 1, pageSize: pageIndex.pageSize ?? 10, disponibilite: pageIndex.disponibilite || undefined }
      : { pageIndex, pageSize };
    const res = await api.get<PagedResult<Medecin>>('/medecins', { params: resolved });
    return res.data;
  },

  async getById(id: number): Promise<Medecin> {
    const res = await api.get<Medecin>(`/medecins/${id}`);
    return res.data;
  },

  async getSimpleList(search = ''): Promise<{ id: number; nom: string; prenom: string }[]> {
    // Endpoint léger accessible aux rôles qui doivent choisir un prescripteur
    // (pharmacien, infirmier...) sans avoir accès au module Médecins.
    const res = await api.get<{ idMedecin: number; nom: string; prenom: string }[]>('/medecins/liste-simple');
    const items = res.data.map(m => ({ id: m.idMedecin, nom: m.nom, prenom: m.prenom }));
    if (!search) return items;
    const term = search.toLowerCase();
    return items.filter(m => `${m.nom} ${m.prenom}`.toLowerCase().includes(term));
  },

  async search(term: string, params?: { pageIndex?: number; pageSize?: number; disponibilite?: string }): Promise<PagedResult<Medecin>> {
    const res = await api.get<PagedResult<Medecin>>(`/medecins/recherche/${encodeURIComponent(term)}`, {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
        disponibilite: params?.disponibilite || undefined,
      },
    });
    return res.data;
  },

  async getBySpecialite(specialiteId: number, params?: { pageIndex?: number; pageSize?: number }): Promise<PagedResult<Medecin>> {
    const res = await api.get<PagedResult<Medecin>>(`/medecins/specialite/${specialiteId}`, {
      params: { pageIndex: params?.pageIndex ?? 1, pageSize: params?.pageSize ?? 10 },
    });
    return res.data;
  },

  async getDisponibles(params?: { pageIndex?: number; pageSize?: number }): Promise<PagedResult<Medecin>> {
    const res = await api.get<PagedResult<Medecin>>('/medecins/disponibles', {
      params: { pageIndex: params?.pageIndex ?? 1, pageSize: params?.pageSize ?? 10 },
    });
    return res.data;
  },

  async create(data: MedecinCreate): Promise<Medecin> {
    const res = await api.post<Medecin>('/medecins', data);
    return res.data;
  },

  async update(id: number, data: Partial<MedecinCreate> & { idMedecin: number }): Promise<Medecin> {
    const res = await api.put<Medecin>(`/medecins/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/medecins/${id}`);
  },

  async getStatistiques(): Promise<MedecinStats> {
    const res = await api.get<MedecinStats>('/medecins/statistiques');
    return res.data;
  },


  async getDetails(id: number): Promise<MedecinDetails> {
    const res = await api.get<MedecinDetails>(`/medecins/${id}/details`);
    return res.data;
  },


};
