import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Fournisseur, FournisseurCreate } from '@/app/types/fournisseur';

export const fournisseurService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Fournisseur>> {
    const res = await api.get('/fournisseurs', { params: { pageIndex, pageSize } });
    return res.data;
  },

  async search(params: { nom?: string; actif?: boolean; pageIndex?: number; pageSize?: number }): Promise<PagedResult<Fournisseur>> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.nom) queryParams.nom = params.nom;
    if (params.actif !== undefined) queryParams.actif = params.actif;
    if (params.pageIndex) queryParams.pageIndex = params.pageIndex;
    if (params.pageSize) queryParams.pageSize = params.pageSize;
    // URL corrigée : /fournisseurs/search (et non /fournisseurs-pharma/search)
    const res = await api.get('/fournisseurs/search', { params: queryParams });
    return res.data;
  },

  async getById(id: number): Promise<Fournisseur> {
    const res = await api.get(`/fournisseurs/${id}`);
    return res.data;
  },

  async create(data: FournisseurCreate): Promise<Fournisseur> {
    const res = await api.post('/fournisseurs', data);
    return res.data;
  },

  async update(id: number, data: Partial<FournisseurCreate>): Promise<Fournisseur> {
    const res = await api.put(`/fournisseurs/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/fournisseurs/${id}`);
  }
};