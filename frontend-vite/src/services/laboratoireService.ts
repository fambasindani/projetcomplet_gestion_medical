import api from './api';
import { Laboratoire, LaboratoireRequest } from '../types/examen';
import { PagedResult } from '../types/pagination';

export const laboratoireService = {
  async search(actif: boolean | undefined, term: string | undefined, pageIndex = 1, pageSize = 10): Promise<PagedResult<Laboratoire>> {
    const res = await api.get('/laboratoires/search', {
      params: { actif, term: term || undefined, pageIndex, pageSize },
    });
    return res.data;
  },
  async getAll(actifsSeulement = true): Promise<Laboratoire[]> {
    const res = await api.get('/laboratoires', { params: { actifsSeulement } });
    return res.data;
  },
  async getAllIncludingInactive(): Promise<Laboratoire[]> {
    const res = await api.get('/laboratoires/tous');
    return res.data;
  },
  async getById(id: number): Promise<Laboratoire> {
    const res = await api.get(`/laboratoires/${id}`);
    return res.data;
  },
  async create(data: LaboratoireRequest): Promise<Laboratoire> {
    const res = await api.post('/laboratoires', data);
    return res.data;
  },
  async update(id: number, data: LaboratoireRequest): Promise<Laboratoire> {
    const res = await api.put(`/laboratoires/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/laboratoires/${id}`);
  },
  async affecter(idPersonnel: number, idLaboratoire: number): Promise<Laboratoire> {
    const res = await api.post('/laboratoires/affectations', { idPersonnel, idLaboratoire });
    return res.data;
  },
  async retirerAffectation(idPersonnel: number): Promise<void> {
    await api.delete(`/laboratoires/affectations/${idPersonnel}`);
  },
};
