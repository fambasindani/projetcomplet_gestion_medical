// services/inventaireService.ts
import api from './api';
import { Inventaire , InventaireRequest, LigneStockTheorique } from '../types/inventaire';
import { PagedResult } from '../types/pagination';

export const inventaireService = {
  async search(params: {
    statut?: string;
    type?: string;
    start?: string;
    end?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<PagedResult<Inventaire>> {
    const res = await api.get('/inventaires', { params });
    return res.data;
  },

  async getById(id: number): Promise<Inventaire> {
    const res = await api.get(`/inventaires/${id}`);
    return res.data;
  },

  async create(data: InventaireRequest): Promise<Inventaire> {
    const res = await api.post('/inventaires', data);
    return res.data;
  },

  async getStockTheorique(): Promise<LigneStockTheorique[]> {
    const res = await api.get('/inventaires/stock-theorique');
    return res.data;
  },

  async valider(id: number, validePar: number): Promise<Inventaire> {
    const res = await api.patch(`/inventaires/${id}/valider`, null, { params: { validePar } });
    return res.data;
  },

  async ajuster(id: number): Promise<Inventaire> {
    const res = await api.patch(`/inventaires/${id}/ajuster`);
    return res.data;
  },

  async cloturer(id: number): Promise<Inventaire> {
    const res = await api.patch(`/inventaires/${id}/cloturer`);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/inventaires/${id}`);
  }
};