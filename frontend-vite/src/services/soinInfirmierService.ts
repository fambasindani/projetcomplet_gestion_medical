import api from './api';
import { SoinInfirmier , SoinInfirmierRequest} from '../types/soin';
import { PagedResult } from '../types/pagination';


export const soinInfirmierService = {
  async getByHospitalisation(hospitalisationId: number): Promise<SoinInfirmier[]> {
    const res = await api.get(`/soins-infirmiers/hospitalisation/${hospitalisationId}`);
    return res.data;
  },
  async getById(id: number): Promise<SoinInfirmier> {
    const res = await api.get(`/soins-infirmiers/${id}`);
    return res.data;
  },
  async search(params: {
    page?: number;
    size?: number;
    pageIndex?: number;
    pageSize?: number;
    typeSoin?: string;
  }): Promise<PagedResult<SoinInfirmier>> {
    const res = await api.get('/soins-infirmiers/search', { params });
    const data = res.data;
    const content = Array.isArray(data) ? data : (data?.content ?? data?.items ?? []);
    const total = typeof data?.totalElements === 'number' ? data.totalElements : (data?.totalCount ?? content.length);
    const totalPages = typeof data?.totalPages === 'number' ? data.totalPages : 0;
    const pageIndex = typeof data?.number === 'number' ? data.number + 1 : (data?.pageIndex ?? 1);
    const pageSize = typeof data?.size === 'number' ? data.size : (data?.pageSize ?? params.size ?? 10);
    return {
      items: content,
      pageIndex,
      pageSize,
      totalCount: total,
      totalPages,
      hasPreviousPage: pageIndex > 1,
      hasNextPage: pageIndex < totalPages,
    };
  },
  async create(data: SoinInfirmierRequest): Promise<SoinInfirmier> {
    const res = await api.post('/soins-infirmiers', data);
    return res.data;
  },
  async update(id: number, data: SoinInfirmierRequest): Promise<SoinInfirmier> {
    const res = await api.put(`/soins-infirmiers/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/soins-infirmiers/${id}`);
  }
};