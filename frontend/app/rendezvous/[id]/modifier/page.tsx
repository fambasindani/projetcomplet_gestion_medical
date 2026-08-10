'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { rendezvousService } from '@/app/services/rendezvousService';
import RendezVousForm from '@/app/components/rendezvous/RendezVousForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { RendezVous } from '@/app/types/rendezvous';

export default function EditRendezVousPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rendezvousService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/rendezvous'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <RendezVousForm initialData={data} isEdit />;
}
