// app/services/interventionService.ts
import api from './api';
import type { InterventionDetails } from '../types/intervention';
import type { PagedResult } from '../types/pagination';

export const interventionService = {
  async getById(id: number): Promise<InterventionDetails> {
    const res = await api.get<InterventionDetails>(`/interventions/${id}`);
    return res.data;
  },

  async getByPatient(patientId: number, pageIndex = 1, pageSize = 20): Promise<PagedResult<InterventionDetails>> {
    const res = await api.get<PagedResult<InterventionDetails>>(`/interventions/patient/${patientId}`, {
      params: { pageIndex, pageSize },
    });
    return res.data;
  },
};
