// app/services/acteMedicalService.ts
import api from './api';
import type {
  ActeMedical,
  ActeMedicalCreate,
  CategorieActeMedical,
} from '../types/facture';
import type { PagedResult } from '../types/pagination';

export interface ActeMedicalFiltres {
  pageIndex?: number;
  pageSize?: number;
  categorie?: CategorieActeMedical | '';
  search?: string;
}

export const acteMedicalService = {
  async getAll(params?: ActeMedicalFiltres): Promise<PagedResult<ActeMedical>> {
    const response = await api.get<PagedResult<ActeMedical>>('/actes-medicaux', {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
        categorie: params?.categorie || undefined,
        search: params?.search || undefined,
      },
    });
    return response.data;
  },

  async getById(id: number): Promise<ActeMedical> {
    const response = await api.get<ActeMedical>(`/actes-medicaux/${id}`);
    return response.data;
  },

  async create(data: ActeMedicalCreate): Promise<ActeMedical> {
    const response = await api.post<ActeMedical>('/actes-medicaux', data);
    return response.data;
  },

  async update(id: number, data: ActeMedicalCreate): Promise<ActeMedical> {
    const response = await api.put<ActeMedical>(`/actes-medicaux/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/actes-medicaux/${id}`);
  },

  async getSimpleList(
    categorie?: CategorieActeMedical,
    search = ''
  ): Promise<Pick<ActeMedical, 'idActe' | 'codeActe' | 'libelle' | 'prixBase'>[]> {
    const response = await api.get<PagedResult<ActeMedical>>('/actes-medicaux', {
      params: {
        pageIndex: 1,
        pageSize: 100,
        categorie: categorie || undefined,
        search: search || undefined,
      },
    });
    return response.data.items.map((acte) => ({
      idActe: acte.idActe,
      codeActe: acte.codeActe,
      libelle: acte.libelle,
      prixBase: acte.prixBase,
    }));
  },
};
