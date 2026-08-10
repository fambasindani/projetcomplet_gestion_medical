import api from './api';
import type { DelivranceResponse, DelivranceRequest, DelivranceUpdateRequest, DelivranceStatistiques } from '../types/delivrance';
import type { PagedResult } from '../types/pagination';


export const delivranceService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<DelivranceResponse>> {
    const res = await api.get('/delivrances', { params: { pageIndex, pageSize } });
    return res.data;
  },

  // dans delivranceService.ts
async getById(id: number): Promise<DelivranceResponse> {
  const res = await api.get(`/delivrances/${id}`);
  return res.data;
},

async update(id: number, data: DelivranceUpdateRequest): Promise<DelivranceResponse> {
  const res = await api.put(`/delivrances/${id}`, data);
  return res.data;
},



  async search(keyword: string, pageIndex = 1, pageSize = 10): Promise<PagedResult<DelivranceResponse>> {
    const res = await api.get('/delivrances/search', { params: { keyword, pageIndex, pageSize } });
    return res.data;
  },


/*   async getById(id: number): Promise<DelivranceResponse> {
    const res = await api.get(`/delivrances/${id}`);
    return res.data;
  }, */

  async create(data: DelivranceRequest): Promise<DelivranceResponse> {
    const res = await api.post('/delivrances', data);
    return res.data;
  },

  async getStatistiques(): Promise<DelivranceStatistiques> {
    const res = await api.get('/delivrances/statistiques');
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/delivrances/${id}`);
  },
};