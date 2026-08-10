import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Medicament, MedicamentCreate } from '@/app/types/medicament';

interface SearchParams {
  pageIndex: number;
  pageSize: number;
  nom?: string;
  idCategorie?: number;
  actif?: boolean;
}

export const medicamentService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Medicament>> {
    const res = await api.get('/medicaments', { params: { pageIndex, pageSize } });
    return res.data;
  },

  async search(nom?: string, idCategorie?: number, actif?: boolean, pageIndex = 1, pageSize = 10): Promise<PagedResult<Medicament>> {
    const params: SearchParams = { pageIndex, pageSize };
    if (nom) params.nom = nom;
    if (idCategorie) params.idCategorie = idCategorie;
    if (actif !== undefined) params.actif = actif;
    const res = await api.get('/medicaments/search', { params });
    return res.data;
  },

  async getById(id: number): Promise<Medicament> {
    const res = await api.get(`/medicaments/${id}`);
    return res.data;
  },

  async create(data: MedicamentCreate): Promise<Medicament> {
    const res = await api.post('/medicaments', data);
    return res.data;
  },

  async update(id: number, data: Partial<MedicamentCreate>): Promise<Medicament> {
    const res = await api.put(`/medicaments/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/medicaments/${id}`);
  },

  async getSimpleList(search = ''): Promise<{ id: number; nomCommercial: string }[]> {
    const res = await this.search(search);
    return res.items.map(m => ({ id: m.idMedicament, nomCommercial: m.nomCommercial }));
  }
};