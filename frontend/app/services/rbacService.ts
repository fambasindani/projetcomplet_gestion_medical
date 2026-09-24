import api from './api';
import type { PermissionDto, RoleDto } from '../types/rbac';
import type { PagedResult } from '../types/pagination';

export interface RoleRequest {
  nom: string;
  description: string | null;
}

export interface PermissionRequest {
  code?: string;
  libelle: string;
  module: string | null;
}

export const rbacService = {
  // ---------- RÔLES ----------
  async getRoles(pageIndex = 1, pageSize = 10): Promise<PagedResult<RoleDto>> {
    const res = await api.get<PagedResult<RoleDto>>('/admin/rbac/roles', {
      params: { pageIndex, pageSize },
    });
    return res.data;
  },

  async getAllRoles(): Promise<RoleDto[]> {
    const res = await this.getRoles(1, 1000);
    return res.items;
  },

  async createRole(data: RoleRequest): Promise<RoleDto> {
    const res = await api.post<RoleDto>('/admin/rbac/roles', data);
    return res.data;
  },

  async updateRole(id: number, data: RoleRequest): Promise<RoleDto> {
    const res = await api.put<RoleDto>(`/admin/rbac/roles/${id}`, data);
    return res.data;
  },

  async deleteRole(id: number): Promise<void> {
    await api.delete(`/admin/rbac/roles/${id}`);
  },

  // ---------- PERMISSIONS ----------
  async getPermissions(pageIndex = 1, pageSize = 10): Promise<PagedResult<PermissionDto>> {
    const res = await api.get<PagedResult<PermissionDto>>('/admin/rbac/permissions', {
      params: { pageIndex, pageSize },
    });
    return res.data;
  },

  async getAllPermissions(): Promise<PermissionDto[]> {
    const res = await this.getPermissions(1, 1000);
    return res.items;
  },

  async createPermission(data: PermissionRequest): Promise<PermissionDto> {
    const res = await api.post<PermissionDto>('/admin/rbac/permissions', data);
    return res.data;
  },

  async updatePermission(id: number, data: PermissionRequest): Promise<PermissionDto> {
    const res = await api.put<PermissionDto>(`/admin/rbac/permissions/${id}`, data);
    return res.data;
  },

  async deletePermission(id: number): Promise<void> {
    await api.delete(`/admin/rbac/permissions/${id}`);
  },

  // ---------- AFFECTATION RÔLE <-> PERMISSION ----------
  async setRolePermissions(role: string, permissions: string[]): Promise<void> {
    await api.put(`/admin/rbac/roles/${encodeURIComponent(role)}/permissions`, { permissions });
  },

  async addPermission(role: string, permission: string): Promise<void> {
    await api.post(`/admin/rbac/roles/${encodeURIComponent(role)}/permissions/${encodeURIComponent(permission)}`);
  },

  async removePermission(role: string, permission: string): Promise<void> {
    await api.delete(`/admin/rbac/roles/${encodeURIComponent(role)}/permissions/${encodeURIComponent(permission)}`);
  },

  // ---------- UTILISATEUR <-> RÔLE ----------
  async getUserRoles(idUtilisateur: number): Promise<string[]> {
    const res = await api.get<string[]>(`/admin/rbac/utilisateurs/${idUtilisateur}/roles`);
    return res.data;
  },

  async setUserRoles(idUtilisateur: number, roles: string[]): Promise<void> {
    await api.put(`/admin/rbac/utilisateurs/${idUtilisateur}/roles`, { roles });
  },
};
