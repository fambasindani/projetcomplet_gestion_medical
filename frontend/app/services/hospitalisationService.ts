import api from './api';
import { PagedResult } from '@/app/types/pagination';
import { Hospitalisation, HospitalisationCreate, StatutHospitalisation } from '@/app/types/hospitalisation';
import { toIsoStartOfDay, toIsoEndOfDay } from '@/app/utils/dateRange';

export const hospitalisationService = {
  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<Hospitalisation>> {
    const res = await api.get('/hospitalisations', { params: { pageIndex, pageSize } });
    return res.data;
  },

    async getSimpleList(): Promise<{ idHospitalisation: number; patientNom: string }[]> {
    // On utilise la méthode getAll avec une grande taille
    const res = await this.getAll(1, 100);
    // Adaptez selon la structure de votre réponse (items)
    return res.items.map((h: Hospitalisation) => ({
      idHospitalisation: h.idHospitalisation,
      patientNom: h.patientNom || `Patient #${h.idPatient}`,
    }));
  },

  async search(filters: {
    statut?: StatutHospitalisation;
    idPatient?: number;
    dateStart?: string;
    dateEnd?: string;
  }, pageIndex = 1, pageSize = 10): Promise<PagedResult<Hospitalisation>> {
    const res = await api.get('/hospitalisations/search', {
      params: {
        ...filters,
        dateStart: toIsoStartOfDay(filters.dateStart || ''),
        dateEnd: toIsoEndOfDay(filters.dateEnd || ''),
        pageIndex,
        pageSize,
      },
    });
    return res.data;
  },

  async getById(id: number): Promise<Hospitalisation> {
    const res = await api.get(`/hospitalisations/${id}`);
    return res.data;
  },

  async create(data: HospitalisationCreate): Promise<Hospitalisation> {
    const res = await api.post('/hospitalisations', data);
    return res.data;
  },

  async update(id: number, data: Partial<HospitalisationCreate>): Promise<Hospitalisation> {
    const res = await api.put(`/hospitalisations/${id}`, data);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/hospitalisations/${id}`);
  },

  async changerStatut(id: number, statut: StatutHospitalisation): Promise<Hospitalisation> {
  const res = await api.patch(`/hospitalisations/${id}/statut`, null, { params: { statut } });
  return res.data;
}
};