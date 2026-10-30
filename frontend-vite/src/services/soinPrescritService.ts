import api from './api';
import { SoinPrescrit, SoinPrescritRequest } from '../types/soin';


export const soinPrescritService = {
  async getByPrescription(prescriptionId: number): Promise<SoinPrescrit[]> {
    const res = await api.get(`/soins-prescriptions/prescription/${prescriptionId}`);
    return res.data;
  },

  async getById(id: number): Promise<SoinPrescrit> {
    const res = await api.get(`/soins-prescriptions/${id}`);
    return res.data;
  },

  async create(data: SoinPrescritRequest): Promise<SoinPrescrit> {
    const res = await api.post('/soins-prescriptions', data);
    return res.data;
  },

  async update(id: number, data: SoinPrescritRequest): Promise<SoinPrescrit> {
    const res = await api.put(`/soins-prescriptions/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/soins-prescriptions/${id}`);
  }
};