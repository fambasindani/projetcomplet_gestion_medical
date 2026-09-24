'use client';

import { useState } from 'react';
import { FaShieldAlt, FaKey, FaUsers } from 'react-icons/fa';
import RolesCrud from '@/app/components/settings/RolesCrud';
import PermissionsCrud from '@/app/components/settings/PermissionsCrud';
import UsersRoles from '@/app/components/settings/UsersRoles';
import PageHeader from '@/app/ui/PageHeader';

type Onglet = 'roles' | 'permissions' | 'utilisateurs';

const onglets: { key: Onglet; label: string; icon: React.ElementType }[] = [
  { key: 'roles', label: 'Rôles', icon: FaShieldAlt },
  { key: 'permissions', label: 'Permissions', icon: FaKey },
  { key: 'utilisateurs', label: 'Utilisateurs & rôles', icon: FaUsers },
];

export default function SettingsRolesPage() {
  const [onglet, setOnglet] = useState<Onglet>('roles');

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        subtitle={<><FaShieldAlt className="inline mr-1" /> Rôles, permissions et affectations</>}
      />

      <div className="flex flex-wrap gap-2 border-b border-slate-200">
        {onglets.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setOnglet(key)}
            className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
              onglet === key
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon /> {label}
          </button>
        ))}
      </div>

      {onglet === 'roles' && <RolesCrud />}
      {onglet === 'permissions' && <PermissionsCrud />}
      {onglet === 'utilisateurs' && <UsersRoles />}
    </div>
  );
}
