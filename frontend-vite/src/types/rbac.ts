import type { UserRole } from './user';

export interface RoleDto {
  id: number;
  nom: UserRole;
  description: string | null;
  permissions: string[];
}

export interface PermissionDto {
  id: number;
  code: string;
  libelle: string;
  module: string | null;
}
