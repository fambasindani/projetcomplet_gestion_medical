import api from './api';
import type { PagedResult, PaginationParams } from '../types/pagination';

export type TypeNotification =
  | 'STOCK_FAIBLE'
  | 'STOCK_CRITIQUE'
  | 'PEREMPTION_PROCHAINE'
  | 'PEREMPTION_DEPASSEE'
  | 'NOUVEAU_RDV'
  | 'RDV_AUJOURDHUI'
  | 'NOUVEL_INVENTAIRE'
  | 'NOUVELLE_COMMANDE'
  | 'SYSTEME';

export interface Notification {
  idNotification: number;
  typeNotification: TypeNotification;
  titre: string;
  message?: string;
  referenceType?: string;
  referenceId?: number;
  lue: boolean;
  dateCreation: string;
}

export interface NotificationCreate {
  typeNotification: TypeNotification;
  titre: string;
  message?: string;
  referenceType?: string;
  referenceId?: number;
  lue?: boolean;
}

export const notificationService = {
  async getAll(params?: PaginationParams & { lue?: boolean }): Promise<PagedResult<Notification>> {
    const response = await api.get<PagedResult<Notification>>('/notifications', {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
        lue: params?.lue,
      },
    });
    return response.data;
  },

  async getNonLues(params?: PaginationParams): Promise<PagedResult<Notification>> {
    const response = await api.get<PagedResult<Notification>>('/notifications/non-lues', {
      params: {
        pageIndex: params?.pageIndex ?? 1,
        pageSize: params?.pageSize ?? 10,
      },
    });
    return response.data;
  },

  async countNonLues(): Promise<number> {
    const response = await api.get<{ count: number }>('/notifications/count-non-lues');
    return response.data.count;
  },

  async getById(id: number): Promise<Notification> {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  async create(data: NotificationCreate): Promise<Notification> {
    const response = await api.post<Notification>('/notifications', data);
    return response.data;
  },

  async marquerLue(id: number): Promise<Notification> {
    const response = await api.patch<Notification>(`/notifications/${id}/lue`);
    return response.data;
  },

  async marquerToutesLues(): Promise<number> {
    const response = await api.patch<{ updated: number }>('/notifications/lire-toutes');
    return response.data.updated;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },
};
