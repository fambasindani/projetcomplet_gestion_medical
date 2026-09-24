'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { FaArrowLeft, FaEdit, FaEnvelope, FaCalendarAlt, FaCheckCircle, FaIdCard } from 'react-icons/fa';
import { userService } from '@/app/services/userService';
import { User } from '@/app/types/user';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import Button from '@/app/ui/Button';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';

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
    <PageShell
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
    >
      <DetailBanner
        title={`${user.nom} ${user.prenom}`}
        subtitle={user.role}
        meta="Utilisateur"
        badges={
          <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold uppercase ${user.actif ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
            {user.actif ? <><FaCheckCircle className="mr-1" /> Actif</> : 'Inactif'}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaIdCard} label="ID" value={user.id} />
          <InfoCard icon={FaEnvelope} label="Email" value={user.email} />
          <InfoCard icon={FaCalendarAlt} label="Date création" value={format(new Date(user.dateCreation), 'dd/MM/yyyy HH:mm')} />
          <InfoCard icon={FaCalendarAlt} label="Dernière modification" value={format(new Date(user.dateModification), 'dd/MM/yyyy HH:mm')} />
          <InfoCard icon={FaCheckCircle} label="Actif" value={user.actif ? 'Oui' : 'Non'} />
          {user.personnelId && (
            <InfoCard icon={FaIdCard} label="Personnel associé" value={`ID ${user.personnelId}`} />
          )}
        </InfoGrid>
      </DetailBanner>
    </PageShell>
  );
}
