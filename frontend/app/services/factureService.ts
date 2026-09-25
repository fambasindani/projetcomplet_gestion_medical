// app/services/factureService.ts
import api from './api';
import type {
  Facture,
  FactureCreate,
  FactureStats,
  PaiementCreate,
  StatutFacture,
} from '../types/facture';
import type { PagedResult } from '../types/pagination';
import { toIsoStartOfDay, toIsoEndOfDay } from '../utils/dateRange';

export type SourceElement =
  | 'CONSULTATION'
  | 'EXAMEN'
  | 'MEDICAMENT'
  | 'HOSPITALISATION'
  | 'SOIN'
  | 'INTERVENTION';

export interface ElementFacturable {
  source: SourceElement;
  idSource: number | null;
  idActe: number | null;
  idActeCatalogue?: number | null;
  idMedicament: number | null;
  idHospitalisation: number | null;
  description: string;
  quantite: number;
  prixUnitaire: number;
  dateElement: string | null;
}

export const SourceElementLabels: Record<SourceElement, string> = {
  CONSULTATION: 'Consultation',
  EXAMEN: 'Examen',
  MEDICAMENT: 'Médicament',
  HOSPITALISATION: 'Hospitalisation',
  SOIN: 'Soin',
  INTERVENTION: 'Intervention',
};

export interface FactureFiltres {
  pageIndex?: number;
  pageSize?: number;
  statut?: StatutFacture | '';
  idPatient?: number | null;
  dateStart?: string;
  dateEnd?: string;
}

export const factureService = {
  async getAll(filtres?: FactureFiltres): Promise<PagedResult<Facture>> {
    const response = await api.get<PagedResult<Facture>>('/factures', {
      params: {
        pageIndex: filtres?.pageIndex ?? 1,
        pageSize: filtres?.pageSize ?? 10,
        statut: filtres?.statut || undefined,
        idPatient: filtres?.idPatient ?? undefined,
        dateStart: toIsoStartOfDay(filtres?.dateStart),
        dateEnd: toIsoEndOfDay(filtres?.dateEnd),
      },
    });
    return response.data;
  },

  async getById(id: number): Promise<Facture> {
    const response = await api.get<Facture>(`/factures/${id}`);
    return response.data;
  },

  async getStatistiques(params?: {
    dateDebut?: string | null;
    dateFin?: string | null;
    granularite?: 'day' | 'month' | 'year';
  }): Promise<FactureStats> {
    const response = await api.get<FactureStats>('/factures/statistiques', {
      params: {
        dateDebut: params?.dateDebut || undefined,
        dateFin: params?.dateFin || undefined,
        granularite: params?.granularite || undefined,
      },
    });
    return response.data;
  },

  async getElementsPatient(
    idPatient: number,
    idConsultation?: number | null,
    idHospitalisation?: number | null,
    dateDebut?: string | null,
    dateFin?: string | null
  ): Promise<ElementFacturable[]> {
    const response = await api.get<PagedResult<ElementFacturable>>(`/factures/elements/${idPatient}`, {
      params: {
        pageIndex: 1,
        pageSize: 500,
        idConsultation: idConsultation ?? undefined,
        idHospitalisation: idHospitalisation ?? undefined,
        dateDebut: dateDebut || undefined,
        dateFin: dateFin || undefined,
      },
    });
    return response.data.items;
  },

  async create(data: FactureCreate): Promise<Facture> {
    const response = await api.post<Facture>('/factures', data);
    return response.data;
  },

  async update(id: number, data: FactureCreate): Promise<Facture> {
    const response = await api.put<Facture>(`/factures/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/factures/${id}`);
  },

  async annuler(id: number): Promise<Facture> {
    const response = await api.patch<Facture>(`/factures/${id}/annuler`);
    return response.data;
  },

  async ajouterPaiement(id: number, data: PaiementCreate): Promise<Facture> {
    const response = await api.post<Facture>(`/factures/${id}/paiements`, data);
    return response.data;
  },
};
