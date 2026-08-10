// app/services/factureService.ts
import api from './api';
import type {
  Facture,
  FactureCreate,
  FactureStats,
  PaiementCreate,
  StatutFacture,
} from '../types/facture';
import type { PagedResult } from '../types/pagination';

export interface FactureFiltres {
  pageIndex?: number;
  pageSize?: number;
  statut?: StatutFacture | '';
  idPatient?: number | null;
  dateStart?: string;
  dateEnd?: string;
}

export const factureService = {
  async getAll(filtres?: FactureFiltres): Promise<PagedResult<Facture>> {
    const response = await api.get<PagedResult<Facture>>('/factures', {
      params: {
        pageIndex: filtres?.pageIndex ?? 1,
        pageSize: filtres?.pageSize ?? 10,
        statut: filtres?.statut || undefined,
        idPatient: filtres?.idPatient ?? undefined,
        dateStart: filtres?.dateStart || undefined,
        dateEnd: filtres?.dateEnd || undefined,
      },
    });
    return response.data;
  },

  async getById(id: number): Promise<Facture> {
    const response = await api.get<Facture>(`/factures/${id}`);
    return response.data;
  },

  async getStatistiques(): Promise<FactureStats> {
    const response = await api.get<FactureStats>('/factures/statistiques');
    return response.data;
  },

  async create(data: FactureCreate): Promise<Facture> {
    const response = await api.post<Facture>('/factures', data);
    return response.data;
  },

  async update(id: number, data: FactureCreate): Promise<Facture> {
    const response = await api.put<Facture>(`/factures/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/factures/${id}`);
  },

  async annuler(id: number): Promise<Facture> {
    const response = await api.patch<Facture>(`/factures/${id}/annuler`);
    return response.data;
  },

  async ajouterPaiement(id: number, data: PaiementCreate): Promise<Facture> {
    const response = await api.post<Facture>(`/factures/${id}/paiements`, data);
    return response.data;
  },
};
