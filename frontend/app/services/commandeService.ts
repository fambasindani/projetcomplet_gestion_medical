import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { CommandeFournisseur, CommandeCreate, StatutCommandeFournisseur } from '@/app/types/commande';
import { toIsoStartOfDay, toIsoEndOfDay } from '@/app/utils/dateRange';

export const commandeService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<CommandeFournisseur>> {
    const res = await api.get('/commandes-fournisseurs', { params: { pageIndex, pageSize } });
    return res.data;
  },

  async search(params: {
    statut?: StatutCommandeFournisseur;
    idFournisseur?: number;
    dateStart?: string;
    dateEnd?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<PagedResult<CommandeFournisseur>> {
    const res = await api.get('/commandes-fournisseurs/search', {
      params: {
        ...params,
        dateStart: toIsoStartOfDay(params.dateStart),
        dateEnd: toIsoEndOfDay(params.dateEnd),
      },
    });
    return res.data;
  },

  async getById(id: number): Promise<CommandeFournisseur> {
    const res = await api.get(`/commandes-fournisseurs/${id}`);
    return res.data;
  },

  async create(data: CommandeCreate): Promise<CommandeFournisseur> {
    const res = await api.post('/commandes-fournisseurs', data);
    return res.data;
  },

  async update(id: number, data: Partial<CommandeCreate>): Promise<CommandeFournisseur> {
    const res = await api.put(`/commandes-fournisseurs/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/commandes-fournisseurs/${id}`);
  }
};