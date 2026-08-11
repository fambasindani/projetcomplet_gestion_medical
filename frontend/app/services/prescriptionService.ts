import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Prescription, PrescriptionCreate, StatutPrescription, TypePrescription, PrescriptionMedicament } from '@/app/types/prescription';
import { toIsoStartOfDay, toIsoEndOfDay } from '@/app/utils/dateRange';

export const prescriptionService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Prescription>> {
    const res = await api.get('/prescriptions', { params: { pageIndex, pageSize } });
    return res.data;
  },

  async getByType(type: TypePrescription, pageIndex = 1, pageSize = 10): Promise<PagedResult<Prescription>> {
    const res = await api.get(`/prescriptions/type/${type}`, { params: { pageIndex, pageSize } });
    return res.data;
  },

  async getByPatient(patientId: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<Prescription>> {
    const res = await api.get(`/prescriptions/patient/${patientId}`, { params: { pageIndex, pageSize } });
    return res.data;
  },

  async getByMedecin(medecinId: number, pageIndex = 1, pageSize = 10): Promise<PagedResult<Prescription>> {
    const res = await api.get(`/prescriptions/medecin/${medecinId}`, { params: { pageIndex, pageSize } });
    return res.data;
  },

  async search(filters: { type?: TypePrescription | string; statut?: StatutPrescription | string; idPatient?: number; dateStart?: string; dateEnd?: string },
              pageIndex = 1, pageSize = 10): Promise<PagedResult<Prescription>> {
    const res = await api.get('/prescriptions/search', {
      params: { ...filters, dateStart: toIsoStartOfDay(filters.dateStart), dateEnd: toIsoEndOfDay(filters.dateEnd), pageIndex, pageSize },
    });
    return res.data;
  },

  async getById(id: number): Promise<Prescription> {
    const res = await api.get(`/prescriptions/${id}`);
    return res.data;
  },

  async getMedicamentsByPrescription(id: number): Promise<PrescriptionMedicament[]> {
    const res = await api.get(`/prescriptions/${id}/medicaments`);
    return res.data;
  },

  async create(data: PrescriptionCreate): Promise<Prescription> {
    const res = await api.post('/prescriptions', data);
    return res.data;
  },



  async update(id: number, data: Partial<PrescriptionCreate>): Promise<Prescription> {
    const res = await api.put(`/prescriptions/${id}`, data);
    return res.data;
  },

  async annuler(id: number, motif: string): Promise<void> {
    await api.patch(`/prescriptions/${id}/annuler`, null, { params: { motif } });
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/prescriptions/${id}`);
  }
};