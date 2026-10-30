import api from './api';
import type {
  Genre,
  Patient,
  PatientCreate,
  PatientUpdate,
  PatientStats,
  PatientDetails,
} from '../types/patient';
import type { PagedResult, PaginationParams } from '../types/pagination';

export const patientService = {
  async getAll(params?: PaginationParams): Promise<PagedResult<Patient>> {
    const response = await api.get<PagedResult<Patient>>('/patient', {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getById(id: number): Promise<Patient> {
    const response = await api.get<Patient>(`/patient/${id}`);
    return response.data;
  },

  async search(term: string, params?: PaginationParams): Promise<PagedResult<Patient>> {
    const response = await api.get<PagedResult<Patient>>('/patient/recherche', {
      params: {
        term,
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async getByGenre(genre: Genre, params?: PaginationParams): Promise<PagedResult<Patient>> {
    const response = await api.get<PagedResult<Patient>>(`/patient/genre/${genre}`, {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async create(data: PatientCreate): Promise<Patient> {
    const response = await api.post<Patient>('/patient', data);
    return response.data;
  },

  async update(id: number, data: PatientUpdate): Promise<Patient> {
    const response = await api.put<Patient>(`/patient/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/patient/${id}`);
  },

  async getStatistiques(): Promise<PatientStats> {
    const response = await api.get<PatientStats>('/patient/statistiques');
    return response.data;
  },

  async getDetails(id: number): Promise<PatientDetails> {
    const response = await api.get<PatientDetails>(`/patient/${id}/details`);
    return response.data;
  },

 // app/services/patientService.ts
async getSimpleList(search = ''): Promise<{ id: number; nom: string; prenom: string }[]> {
  // Utiliser l'endpoint de recherche dédié
  const response = await api.get<PagedResult<Patient>>('/patient/recherche', {
    params: {
      term: search,
      pageIndex: 1,
      pageSize: 100,
    },
  });
  // response.data.items est un tableau de Patient
  return response.data.items.map((patient: Patient) => ({
    id: patient.idPatient,
    nom: patient.nom,
    prenom: patient.prenom,
  }));
}


};