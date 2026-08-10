import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Chambre, ChambreCreate, StatutChambre, TypeChambre } from '@/app/types/chambre';

export const chambreService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Chambre>> {
    const response = await api.get('/chambres', { params: { pageIndex, pageSize } });
    return response.data;
  },

  async getByStatut(statut: StatutChambre, pageIndex = 1, pageSize = 10): Promise<PagedResult<Chambre>> {
    const response = await api.get(`/chambres/statut/${statut}`, { params: { pageIndex, pageSize } });
    return response.data;
  },

  async getByType(type: TypeChambre, pageIndex = 1, pageSize = 10): Promise<PagedResult<Chambre>> {
    const response = await api.get(`/chambres/type/${type}`, { params: { pageIndex, pageSize } });
    return response.data;
  },

  async search(filters: { statut?: StatutChambre; type?: TypeChambre; etage?: number }, pageIndex = 1, pageSize = 10): Promise<PagedResult<Chambre>> {
    const response = await api.get('/chambres/search', { params: { ...filters, pageIndex, pageSize } });
    return response.data;
  },

  async getById(id: number): Promise<Chambre> {
    const response = await api.get(`/chambres/${id}`);
    return response.data;
  },

  async create(data: ChambreCreate): Promise<Chambre> {
    const response = await api.post('/chambres', data);
    return response.data;
  },

  async update(id: number, data: Partial<ChambreCreate>): Promise<Chambre> {
    const response = await api.put(`/chambres/${id}`, data);
    return response.data;
  },

  async changerStatut(id: number, statut: StatutChambre): Promise<Chambre> {
    const response = await api.patch(`/chambres/${id}/statut`, null, { params: { statut } });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/chambres/${id}`);
  }
};