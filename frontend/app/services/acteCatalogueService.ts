// app/services/acteCatalogueService.ts
import api from './api';
import type { CategorieActeMedical } from '../types/facture';

export interface GroupeActe {
  idGroupe: number;
  libelle: string;
  categorie: CategorieActeMedical;
  description: string | null;
  actif: boolean;
}

export interface ActeCatalogue {
  idActeCatalogue: number;
  code: string;
  libelle: string;
  idGroupe: number | null;
  groupeLibelle: string | null;
  categorie: CategorieActeMedical | null;
  prixDefaut: number;
  coefficient: number | null;
  lettreCle: string | null;
  remboursable: boolean;
  tauxRemboursement: number | null;
  description: string | null;
  actif: boolean;
  dateCreation: string;
}

export interface ActeCatalogueRequest {
  code: string;
  libelle: string;
  idGroupe: number;
  prixDefaut: number;
  coefficient?: number | null;
  lettreCle?: string | null;
  remboursable?: boolean;
  tauxRemboursement?: number | null;
  description: string | null;
  actif: boolean;
}

export interface GroupeActeRequest {
  libelle: string;
  categorie: CategorieActeMedical;
  description: string | null;
  actif: boolean;
}

export const acteCatalogueService = {
  // Autocomplete (actes actifs)
  async getGroupes(categorie: CategorieActeMedical): Promise<GroupeActe[]> {
    const response = await api.get<GroupeActe[]>('/actes-catalogue/groupes', {
      params: { categorie },
    });
    return response.data;
  },

  async search(categorie?: CategorieActeMedical, idGroupe?: number, search?: string): Promise<ActeCatalogue[]> {
    const response = await api.get<ActeCatalogue[]>('/actes-catalogue', {
      params: {
        categorie: categorie || undefined,
        idGroupe: idGroupe || undefined,
        search: search || undefined,
      },
    });
    return response.data;
  },

  // Admin (inclut les inactifs)
  async searchAdmin(categorie?: CategorieActeMedical, idGroupe?: number, search?: string): Promise<ActeCatalogue[]> {
    const response = await api.get<ActeCatalogue[]>('/actes-catalogue/admin', {
      params: {
        categorie: categorie || undefined,
        idGroupe: idGroupe || undefined,
        search: search || undefined,
      },
    });
    return response.data;
  },

  async getGroupesAdmin(categorie?: CategorieActeMedical): Promise<GroupeActe[]> {
    const response = await api.get<GroupeActe[]>('/actes-catalogue/groupes/admin', {
      params: { categorie: categorie || undefined },
    });
    return response.data;
  },

  async createActe(data: ActeCatalogueRequest): Promise<ActeCatalogue> {
    const response = await api.post<ActeCatalogue>('/actes-catalogue', data);
    return response.data;
  },

  async updateActe(id: number, data: ActeCatalogueRequest): Promise<ActeCatalogue> {
    const response = await api.put<ActeCatalogue>(`/actes-catalogue/${id}`, data);
    return response.data;
  },

  async deleteActe(id: number): Promise<void> {
    await api.delete(`/actes-catalogue/${id}`);
  },

  async createGroupe(data: GroupeActeRequest): Promise<GroupeActe> {
    const response = await api.post<GroupeActe>('/actes-catalogue/groupes', data);
    return response.data;
  },

  async updateGroupe(id: number, data: GroupeActeRequest): Promise<GroupeActe> {
    const response = await api.put<GroupeActe>(`/actes-catalogue/groupes/${id}`, data);
    return response.data;
  },

  async deleteGroupe(id: number): Promise<void> {
    await api.delete(`/actes-catalogue/groupes/${id}`);
  },
};
