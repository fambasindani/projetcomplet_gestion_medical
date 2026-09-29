import api from './api';
import { PagedResult } from '../types/pagination';

export interface PersonnelAffecteService {
  idPersonnel: number;
  nom: string;
  fonction?: string;
}

export interface ServiceHospitalier {
  idService: number;
  nom: string;
  pole?: string | null;
  type?: string | null;
  responsable?: string | null;
  actif: boolean;
  dateCreation?: string;
  personnel?: PersonnelAffecteService[];
}

export interface ServiceHospitalierRequest {
  nom: string;
  pole?: string | null;
  type?: string | null;
  responsable?: string | null;
  actif?: boolean;
}

export const serviceHospitalierService = {
  async getAll(actifsSeulement = true): Promise<ServiceHospitalier[]> {
    const res = await api.get('/services', { params: { actifsSeulement } });
    return res.data;
  },
  async search(actif: boolean | undefined, term: string | undefined, pageIndex = 1, pageSize = 10): Promise<PagedResult<ServiceHospitalier>> {
    const res = await api.get('/services/search', {
      params: { actif, term: term || undefined, pageIndex, pageSize },
    });
    return res.data;
  },
  async getById(id: number): Promise<ServiceHospitalier> {
    const res = await api.get(`/services/${id}`);
    return res.data;
  },
  async create(data: ServiceHospitalierRequest): Promise<ServiceHospitalier> {
    const res = await api.post('/services', data);
    return res.data;
  },
  async update(id: number, data: ServiceHospitalierRequest): Promise<ServiceHospitalier> {
    const res = await api.put(`/services/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/services/${id}`);
  },
  async affecter(idPersonnel: number, idService: number): Promise<ServiceHospitalier> {
    const res = await api.post('/services/affectations', { idPersonnel, idService });
    return res.data;
  },
  async retirerAffectation(idPersonnel: number): Promise<void> {
    await api.delete(`/services/affectations/${idPersonnel}`);
  },
};