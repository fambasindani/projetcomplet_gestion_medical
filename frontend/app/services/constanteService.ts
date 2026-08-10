import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Constante, ConstanteCreate } from '@/app/types/constante';

export const constanteService = {
  async getByHospitalisation(idHospitalisation: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<Constante>> {
    const res = await api.get(`/constantes/hospitalisation/${idHospitalisation}`, { params: { pageIndex, pageSize } });
    return res.data;
  },
  async getById(id: number): Promise<Constante> {
    const res = await api.get(`/constantes/${id}`);
    return res.data;
  },
  async create(data: ConstanteCreate): Promise<Constante> {
    const res = await api.post('/constantes', data);
    return res.data;
  },
  async update(id: number, data: Partial<ConstanteCreate>): Promise<Constante> {
    const res = await api.put(`/constantes/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/constantes/${id}`);
  }
};