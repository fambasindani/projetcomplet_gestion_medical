import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Categorie, CategorieCreate } from '@/app/types/categorie';

export const categorieService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Categorie>> {
    const res = await api.get('/categories', { params: { pageIndex, pageSize } });
    return res.data;
  },
  async getById(id: number): Promise<Categorie> {
    const res = await api.get(`/categories/${id}`);
    return res.data;
  },
  async create(data: CategorieCreate): Promise<Categorie> {
    const res = await api.post('/categories', data);
    return res.data;
  },
  async update(id: number, data: Partial<CategorieCreate>): Promise<Categorie> {
    const res = await api.put(`/categories/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
};