import api from './api';
import { User, UserCreate, UserUpdate } from '../types/user';
import { PagedResult } from '../types/pagination';

export interface UserSearchParams {
  pageIndex?: number;
  pageSize?: number;
  term?: string;
  role?: string;
  actif?: boolean;
}

export const userService = {
  async search(params: UserSearchParams = {}): Promise<PagedResult<User>> {
    const res = await api.get<PagedResult<User>>('/admin/users', {
      params: {
        pageIndex: params.pageIndex ?? 1,
        pageSize: params.pageSize ?? 10,
        term: params.term || undefined,
        role: params.role || undefined,
        actif: params.actif,
      },
    });
    return res.data;
  },

  async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<User>> {
    return this.search({ pageIndex, pageSize });
  },

  async getById(id: number): Promise<User> {
    const res = await api.get(`/admin/users/${id}`);
    return res.data;
  },
  async create(data: UserCreate): Promise<User> {
    const res = await api.post('/admin/users', data);
    return res.data;
  },
  async update(id: number, data: UserUpdate): Promise<User> {
    const res = await api.put(`/admin/users/${id}`, data);
    return res.data;
  },
  async delete(id: number): Promise<void> {
    await api.delete(`/admin/users/${id}`);
  }
};
