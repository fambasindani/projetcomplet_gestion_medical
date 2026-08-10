import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Consultation, ConsultationCreate, ConsultationStatsData } from '@/app/types/consultation';

export const consultationService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Consultation>> {
    const response = await api.get('/consultations', { params: { pageIndex, pageSize } });
    return response.data;
  },
  async getByPatient(patientId: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<Consultation>> {
    const response = await api.get(`/consultations/patient/${patientId}`, { params: { pageIndex, pageSize } });
    return response.data;
  },
  async getByMedecin(medecinId: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<Consultation>> {
    const response = await api.get(`/consultations/medecin/${medecinId}`, { params: { pageIndex, pageSize } });
    return response.data;
  },
  async getById(id: number): Promise<Consultation> {
    const response = await api.get(`/consultations/${id}`);
    return response.data;
  },
  async create(data: ConsultationCreate): Promise<Consultation> {
    const response = await api.post('/consultations', data);
    return response.data;
  },
  async update(id: number, data: Partial<ConsultationCreate>): Promise<Consultation> {
    const response = await api.put(`/consultations/${id}`, data);
    return response.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/consultations/${id}`);
  },

  async getStats(): Promise<ConsultationStatsData> {
    const response = await api.get('/consultations/statistiques');
    const data = response.data || {};
    return {
      totalConsultations: data.total ?? 0,
      consultationsMois: data.consultationsMois ?? 0,
      medecinsActifs: data.medecinsActifs ?? 0,
      topMedecins: data.topMedecins ?? [],
      parMois: data.parMois ?? [],
    };
  }, 


// À l'intérieur du service :
// async getStats(): Promise<ConsultationStatsData> {
//   const response = await api.get('/api/consultations/statistiques');
//   return response.data;
// }


};