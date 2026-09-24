import api from './api';
import type { PersonnelResponse, PersonnelRequest, PersonnelUpdate } from '../types/personnel';
import type { PagedResult }from '../types/pagination';


export const personnelService = {
  async getAll(pageIndex = 1, pageSize = 10, sort = 'nom,asc'): Promise<PagedResult<PersonnelResponse>> {
    const [sortField, sortDirection] = sort.split(',');
    const res = await api.get('/personnel', {
      params: { pageIndex, pageSize, sort: `${sortField},${sortDirection}` },
    });
    return res.data;
  },

  async search(keyword: string, pageIndex = 1, pageSize = 10, fonction?: string): Promise<PagedResult<PersonnelResponse>> {
    const res = await api.get('/personnel/search', {
      params: { keyword, pageIndex, pageSize, fonction },
    });
    return res.data;
  },

  async getById(id: number): Promise<PersonnelResponse> {
    const res = await api.get(`/personnel/${id}`);
    return res.data;
  },

  async create(data: PersonnelRequest): Promise<PersonnelResponse> {
    const res = await api.post('/personnel', data);
    return res.data;
  },

  async update(id: number, data: PersonnelUpdate): Promise<PersonnelResponse> {
    const res = await api.put(`/personnel/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/personnel/${id}`);
  },
};