import api from './api';
import { AlerteStock, AlerteStockRequest, AlerteStockUpdate } from '../types/alerte';
import { PagedResult } from '../types/pagination';
import { TypeAlerteStock } from '../types/alerte';
import { toIsoStartOfDay, toIsoEndOfDay } from '../utils/dateRange';


export const alerteStockService = {
  // Recherche avec filtres (GET /api/alertes-stock)
  async search(params: {
    type?: TypeAlerteStock;
    traitee?: boolean;
    idMedicament?: number;
    dateStart?: string;
    dateEnd?: string;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<PagedResult<AlerteStock>> {
    const res = await api.get('/alertes-stock', {
      params: {
        ...params,
        dateStart: undefined,
        dateEnd: undefined,
        start: toIsoStartOfDay(params.dateStart),
        end: toIsoEndOfDay(params.dateEnd),
      },
    });
    return res.data;
  },

  // Récupération par ID
  async getById(id: number): Promise<AlerteStock> {
    const res = await api.get(`/alertes-stock/${id}`);
    return res.data;
  },

  // Création manuelle (rarement utilisé)
  async create(data: AlerteStockRequest): Promise<AlerteStock> {
    const res = await api.post('/alertes-stock', data);
    return res.data;
  },

  // Mise à jour complète (PUT)
  async update(id: number, data: AlerteStockRequest): Promise<AlerteStock> {
    const res = await api.put(`/alertes-stock/${id}`, data);
    return res.data;
  },

  // Marquer comme traitée (PATCH)
  async traiter(id: number, data: AlerteStockUpdate): Promise<AlerteStock> {
    const res = await api.patch(`/alertes-stock/${id}/traiter`, data);
    return res.data;
  },

  // Suppression
  async delete(id: number): Promise<void> {
    await api.delete(`/alertes-stock/${id}`);
  },

  // Déclencher la vérification manuelle
  async verifier(): Promise<void> {
    await api.post('/alertes-stock/verifier');
  }
};