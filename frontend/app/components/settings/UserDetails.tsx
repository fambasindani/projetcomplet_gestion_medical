'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FaArrowLeft, FaEdit, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaIdCard } from 'react-icons/fa';
import { userService } from '@/app/services/userService';
import { User } from '@/app/types/user';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

export default function UserDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getById(Number(id))
      .then(setUser)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (!user) return <div className="p-6">Utilisateur non trouvé</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails de l'utilisateur"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/settings/utilisateurs')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/settings/utilisateurs/${id}/modifier`)}>
              Modifier
            </Button>
          </>
        }
      />
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-white text-2xl font-bold">{user.nom} {user.prenom}</h1>
          <p className="text-indigo-100">{user.role}</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3"><FaIdCard /><strong>ID :</strong> {user.id}</div>
          <div className="flex items-center gap-3"><FaEnvelope /><strong>Email :</strong> {user.email}</div>
          <div className="flex items-center gap-3"><FaCalendarAlt /><strong>Date création :</strong> {format(new Date(user.dateCreation), 'dd/MM/yyyy HH:mm')}</div>
          <div className="flex items-center gap-3"><FaCalendarAlt /><strong>Dernière modification :</strong> {format(new Date(user.dateModification), 'dd/MM/yyyy HH:mm')}</div>
          <div className="flex items-center gap-3">
            <strong>Actif :</strong>
            {user.actif ? <FaCheckCircle className="text-green-600" /> : <FaTimesCircle className="text-red-600" />}
          </div>
          {user.personnelId && (
            <div><strong>Personnel associé :</strong> ID {user.personnelId}</div>
          )}
        </div>
      </div>
    </div>
  );
}
