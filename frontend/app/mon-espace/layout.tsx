'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaUserLock } from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';

export default function MonEspaceLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Chargement...</div>;
  }

  // Le portail patient est reserve aux comptes de role PATIENT relies a un dossier patient.
  if (user && (user.role !== 'PATIENT' || !user.patientId)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-500">
            <FaUserLock className="text-2xl" />
          </div>
          <h1 className="mt-4 text-lg font-semibold text-slate-800">Espace reserve aux patients</h1>
          <p className="mt-2 text-sm text-slate-500">
            Votre compte ({user.role}) n&apos;est pas relie a un dossier patient.
            Cette section est accessible uniquement aux patients.
          </p>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            Retour au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
