import api from './api';
import type {
  Specialite,
  SpecialiteCreate,
  StatistiquesSpecialites,
} from "../types/specialite";
import type { PagedResult, PaginationParams } from "../types/pagination";
import type { Medecin } from "../types/medecin";
import type { Chambre } from "../types/chambre";

export const specialiteService = {
  async getAll(params?: PaginationParams): Promise<PagedResult<Specialite>> {
    const response = await api.get<PagedResult<Specialite>>("/specialites", {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getActives(params?: PaginationParams): Promise<PagedResult<Specialite>> {
    const response = await api.get<PagedResult<Specialite>>("/specialites/actives", {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getById(id: number): Promise<Specialite> {
    const response = await api.get<Specialite>(`/specialites/${id}`);
    return response.data;
  },

  async getMedecinsBySpecialite(id: number, params?: PaginationParams): Promise<PagedResult<Medecin>> {
    const response = await api.get<PagedResult<Medecin>>(`/specialites/${id}/medecins`, {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getChambresBySpecialite(id: number, params?: PaginationParams): Promise<PagedResult<Chambre>> {
    const response = await api.get<PagedResult<Chambre>>(`/specialites/${id}/chambres`, {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async search(nom: string, params?: PaginationParams): Promise<PagedResult<Specialite>> {
    // Si le terme de recherche est vide ou ne contient que des espaces, on retourne toutes les spécialités
    if (!nom.trim()) {
      return this.getAll(params);
    }
    const response = await api.get<PagedResult<Specialite>>(`/specialites/recherche/${encodeURIComponent(nom)}`, {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getSansMedecins(params?: PaginationParams): Promise<PagedResult<Specialite>> {
    const response = await api.get<PagedResult<Specialite>>("/specialites/sans-medecins", {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getAvecMedecins(params?: PaginationParams): Promise<PagedResult<Specialite>> {
    const response = await api.get<PagedResult<Specialite>>("/specialites/avec-medecins", {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getStatistiques(): Promise<StatistiquesSpecialites> {
    const response = await api.get<StatistiquesSpecialites>("/specialites/statistiques");
    return response.data;
  },

  async create(data: SpecialiteCreate): Promise<Specialite> {
    const response = await api.post<Specialite>("/specialites", data);
    return response.data;
  },

  async update(id: number, data: Partial<Specialite>): Promise<Specialite> {
    const response = await api.put<Specialite>(`/specialites/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/specialites/${id}`);
  },

  async desactiver(id: number): Promise<Specialite> {
    const response = await api.patch<Specialite>(`/specialites/${id}/desactiver`);
    return response.data;
  },

  async activer(id: number): Promise<Specialite> {
    const response = await api.patch<Specialite>(`/specialites/${id}/activer`);
    return response.data;
  },
};