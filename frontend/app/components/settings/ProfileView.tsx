'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { FaUserCircle, FaEnvelope, FaUserTag, FaKey, FaShieldAlt, FaCheck } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  MEDECIN: 'Médecin',
  PATIENT: 'Patient',
  SECRETAIRE: 'Secrétaire',
  PHARMACIEN: 'Pharmacien',
  INFIRMIER: 'Infirmier',
  LABORANTIN: 'Laborantin',
  RH: 'Ressources humaines',
};

const moduleLabels: Record<string, string> = {
  DASHBOARD: 'Tableau de bord',
  PATIENTS: 'Patients',
  CONSULTATIONS: 'Consultations',
  RENDEZ_VOUS: 'Rendez-vous',
  PRESCRIPTIONS: 'Prescriptions',
  EXAMENS: 'Examens',
  CATEGORIES_EXAMEN: "Catégories d'examen",
  HOSPITALISATIONS: 'Hospitalisations',
  CONSTANTES: 'Constantes',
  CHAMBRES: 'Chambres',
  SOINS: 'Soins',
  MEDECINS: 'Médecins',
  SPECIALITES: 'Spécialités',
  PERSONNEL: 'Personnel',
  PHARMACIE: 'Pharmacie',
  URGENCES: 'Urgences',
  FACTURATION: 'Facturation',
  CATALOGUE: "Catalogue d'actes",
  NOTIFICATIONS: 'Notifications',
  UTILISATEURS: 'Utilisateurs & rôles',
};

const moduleOf = (code: string) => code.replace(/_(VOIR|GERER)$/, '');

export default function ProfileView() {
  const { user, permissions } = useAuth();

  const parModule = useMemo(() => {
    const groupes: Record<string, string[]> = {};
    for (const p of permissions) {
      (groupes[moduleOf(p)] ??= []).push(p);
    }
    return Object.entries(groupes).sort(([a], [b]) => a.localeCompare(b));
  }, [permissions]);

  if (!user) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-500 shadow-sm ring-1 ring-slate-200">
        Utilisateur non connecté.
      </div>
    );
  }

  const initiales = `${user.prenom?.[0] ?? ''}${user.nom?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mon profil"
        subtitle={<><FaUserCircle className="inline mr-1" /> Informations de votre compte</>}
        actions={
          <Link href="/change-password">
            <Button variant="secondary" icon={<FaKey />}>Changer mot de passe</Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Identité */}
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-600 text-2xl font-bold text-white">
            {initiales}
          </div>
          <h5 className="text-lg font-semibold text-gray-800">{user.prenom} {user.nom}</h5>
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-medium text-indigo-700">
            <FaUserTag /> {userLabels(user.role)}
          </span>
        </div>

        {/* Coordonnées */}
        <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h5 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">Informations</h5>
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                <FaUserCircle />
              </div>
              <div>
                <dt className="text-xs text-gray-500">Nom complet</dt>
                <dd className="text-sm font-medium text-gray-800">{user.prenom} {user.nom}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                <FaEnvelope />
              </div>
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="text-sm font-medium text-gray-800">{user.email}</dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-500">
                <FaShieldAlt />
              </div>
              <div>
                <dt className="text-xs text-gray-500">Permissions</dt>
                <dd className="text-sm font-medium text-gray-800">{permissions.length} au total</dd>
              </div>
            </div>
          </dl>
        </div>
      </div>

      {/* Permissions groupées par module */}
      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h5 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
          <FaShieldAlt className="text-indigo-500" /> Permissions accordées ({permissions.length})
        </h5>

        {permissions.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune permission.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {parModule.map(([module, perms]) => (
              <div key={module} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="mb-2.5 text-sm font-semibold text-gray-700">
                  {moduleLabels[module] ?? module}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {perms.map((p) => {
                    const gerer = p.endsWith('_GERER');
                    return (
                      <span
                        key={p}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          gerer
                            ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                            : 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
                        }`}
                      >
                        <FaCheck size={8} /> {gerer ? 'Gérer' : 'Consulter'}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function userLabels(role: string) {
  return roleLabels[role] ?? role;
}
