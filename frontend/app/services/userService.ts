import api from './api';
import { User, UserCreate, UserUpdate } from '../types/user';
import { PagedResult } from '../types/pagination';

export const userService = {
 async getAll(pageIndex = 1, pageSize = 10): Promise<PagedResult<User>> {
  const res = await api.get('/admin/users', { params: { page: pageIndex - 1, size: pageSize } });
  const springPage = res.data;
  const currentPageIndex = springPage.number + 1;
  return {
    items: springPage.content,
    pageIndex: currentPageIndex,
    pageSize: springPage.size,
    totalCount: springPage.totalElements,
    totalPages: springPage.totalPages,
    hasPreviousPage: currentPageIndex > 1,
    hasNextPage: currentPageIndex < springPage.totalPages,
  };
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