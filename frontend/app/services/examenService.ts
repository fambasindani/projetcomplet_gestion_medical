import api from './api';
import { PagedResult } from '../types/pagination';
import { ExamenRequest, Examen } from '../types/examen';




export const examenService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Examen>> {
    const res = await api.get('/examens', { params: { pageIndex, pageSize } });
    return res.data;
  },
  async getById(id: number): Promise<Examen> {
    const res = await api.get(`/examens/${id}`);
    return res.data;
  },
  async create(data: ExamenRequest): Promise<Examen> {
    const res = await api.post('/examens', data);
    return res.data;
  },

async createBatch(data: { idPrescription?: number | null; examens: ExamenRequest[] }): Promise<Examen[]> {
  const res = await api.post('/examens/batch', data);
  return res.data;
},

  async getByPrescription(prescriptionId: number): Promise<Examen[]> {
  const res = await api.get(`/examens/prescription/${prescriptionId}`);
  return res.data;
},


  
  async update(id: number, data: ExamenRequest): Promise<Examen> {
    const res = await api.put(`/examens/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/examens/${id}`);
  },
  async getByPatient(patientId: number): Promise<Examen[]> {
    const res = await api.get(`/examens/patient/${patientId}`);
    return res.data;
  },
  async getByMedecin(medecinId: number): Promise<Examen[]> {
    const res = await api.get(`/examens/medecin/${medecinId}`);
    return res.data;
  },
  async getByStatut(statut: string): Promise<Examen[]> {
    const res = await api.get(`/examens/statut/${statut}`);
    return res.data;
  }
};