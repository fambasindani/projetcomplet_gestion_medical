'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaSpinner, FaEnvelope } from 'react-icons/fa';
import { rbacService } from '@/app/services/rbacService';
import { userService } from '@/app/services/userService';
import type { RoleDto } from '@/app/types/rbac';
import type { User } from '@/app/types/user';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  MEDECIN: 'Médecin',
  PATIENT: 'Patient',
  SECRETAIRE: 'Secrétaire',
  PHARMACIEN: 'Pharmacien',
  INFIRMIER: 'Infirmier',
  RH: 'Ressources humaines',
};

export default function UsersRoles() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<RoleDto[]>([]);
  const [userRoles, setUserRoles] = useState<Record<number, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [page, roleList] = await Promise.all([
        userService.getAll(1, 1000),
        rbacService.getAllRoles(),
      ]);
      setUsers(page.items);
      setRoles(roleList);
      const entries = await Promise.all(
        page.items.map(async (u) => [u.id, await rbacService.getUserRoles(u.id)] as const)
      );
      setUserRoles(Object.fromEntries(entries));
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleRole = async (user: User, role: string) => {
    const current = userRoles[user.id] ?? [];
    const active = current.includes(role);
    const next = active ? current.filter((r) => r !== role) : [...current, role];
    const key = `${user.id}-${role}`;
    setSaving(key);
    setUserRoles((prev) => ({ ...prev, [user.id]: next }));
    try {
      await rbacService.setUserRoles(user.id, next);
      toast.success(`Rôles de ${user.prenom} ${user.nom} mis à jour`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
      setUserRoles((prev) => ({ ...prev, [user.id]: current }));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-indigo-600">
        <FaSpinner className="animate-spin text-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Utilisateur</th>
              {roles.map((r) => (
                <th key={r.nom} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {roleLabels[r.nom] ?? r.nom}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => {
              const assigned = userRoles[user.id] ?? [];
              return (
                <tr key={user.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-800">{user.prenom} {user.nom}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <FaEnvelope className="text-gray-400" /> {user.email}
                    </p>
                  </td>
                  {roles.map((r) => {
                    const checked = assigned.includes(r.nom);
                    const key = `${user.id}-${r.nom}`;
                    return (
                      <td key={r.nom} className="px-3 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={saving === key}
                          onChange={() => toggleRole(user, r.nom)}
                          className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {users.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-400">Aucun utilisateur.</p>
        )}
      </div>
    </div>
  );
}
