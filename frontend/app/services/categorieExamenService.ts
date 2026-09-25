import api from './api';
import { CategorieExamen } from '../types/examen';
import { PagedResult } from '../types/pagination';

// Type pour la création et la mise à jour
export interface CategorieExamenRequest {
  code: string;
  libelle: string;
  description?: string;
  actif?: boolean;
  idGroupeCatalogue?: number | null;
}

export const categorieExamenService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<CategorieExamen>> {
    const res = await api.get('/categories-examen', { params: { pageIndex, pageSize } });
    return res.data;
  },
  async getAllList(): Promise<CategorieExamen[]> {
    const res = await api.get('/categories-examen/all');
    return res.data;
  },
  async getById(id: number): Promise<CategorieExamen> {
    const res = await api.get(`/categories-examen/${id}`);
    return res.data;
  },
  async create(data: CategorieExamenRequest): Promise<CategorieExamen> {
    const res = await api.post('/categories-examen', data);
    return res.data;
  },
  async update(id: number, data: CategorieExamenRequest): Promise<CategorieExamen> {
    const res = await api.put(`/categories-examen/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/categories-examen/${id}`);
  },
  


};