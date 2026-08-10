// app/services/planningService.ts
import { PlanningStats, RendezVous } from '../types/planningService';
import api from './api';
import type { PagedResult } from '@/app/types/pagination';

export const planningService = {
  async getRendezVous(params: {
    start?: string;
    end?: string;
    statut?: string;
    idMedecin?: number;
    idPatient?: number;
    pageIndex?: number;
    pageSize?: number;
  }): Promise<PagedResult<RendezVous>> {
    // Utiliser le nouvel endpoint /rendezvous/search
    const response = await api.get('/rendezvous/search', { params });
    return response.data;
  },

  async updateStatut(rdvId: number, statut: string): Promise<void> {
    // Utiliser l'endpoint existant /rendezvous/{id}/statut (ou adapter selon votre backend)
    await api.patch(`/rendezvous/${rdvId}/statut`, null, { params: { statut } });
  },

  // async getStats(): Promise<PlanningStats> {
  //   // Gardez cet appel si vous avez un endpoint /planning/stats, sinon à adapter
  //   const response = await api.get('/planning/stats');
  //   return response.data;
  // },
  // services/planningService.ts
async getStats(idMedecin?: number): Promise<PlanningStats> {
  const res = await api.get('/rendezvous/stats/aujourdhui', { params: { idMedecin } });
  return res.data;
}
};