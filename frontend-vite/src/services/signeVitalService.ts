import api from './api';
import { PagedResult } from '@/types/pagination';
import { SigneVital, SigneVitalCreate } from '@/types/signeVital';

export const signeVitalService = {
  async getByPatient(idPatient: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<SigneVital>> {
    const res = await api.get(`/signes-vitaux/patient/${idPatient}`, { params: { pageIndex, pageSize } });
    return res.data;
  },
  async getById(id: number): Promise<SigneVital> {
    const res = await api.get(`/signes-vitaux/${id}`);
    return res.data;
  },
  async create(data: SigneVitalCreate): Promise<SigneVital> {
    const res = await api.post('/signes-vitaux', data);
    return res.data;
  },
  async update(id: number, data: Partial<SigneVitalCreate>): Promise<SigneVital> {
    const res = await api.put(`/signes-vitaux/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/signes-vitaux/${id}`);
  }
};
