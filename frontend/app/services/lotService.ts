import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { LotMedicament, LotCreate, StatutLot } from '@/app/types/lot';

interface SearchParams {
  idMedicament?: number;
  numeroLot?: string;
  statut?: StatutLot;
  pageIndex?: number;
  pageSize?: number;
}

export const lotService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<LotMedicament>> {
    const res = await api.get('/lots', { params: { pageIndex, pageSize } });
    return res.data;
  },

  async search(params: SearchParams): Promise<PagedResult<LotMedicament>> {
    const queryParams: Record<string, string | number | boolean> = {};
    if (params.idMedicament !== undefined) queryParams.idMedicament = params.idMedicament;
    if (params.numeroLot !== undefined) queryParams.numeroLot = params.numeroLot;
    if (params.statut !== undefined) queryParams.statut = params.statut;
    if (params.pageIndex !== undefined) queryParams.pageIndex = params.pageIndex;
    if (params.pageSize !== undefined) queryParams.pageSize = params.pageSize;
    const res = await api.get('/lots/search', { params: queryParams });
    return res.data;
  },

  async getById(id: number): Promise<LotMedicament> {
    const res = await api.get(`/lots/${id}`);
    return res.data;
  },

  async create(data: LotCreate): Promise<LotMedicament> {
    const res = await api.post('/lots', data);
    return res.data;
  },

  async update(id: number, data: Partial<LotCreate>): Promise<LotMedicament> {
    const res = await api.put(`/lots/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/lots/${id}`);
  }
};