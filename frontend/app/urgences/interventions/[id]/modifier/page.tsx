'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { urgenceService } from '@/app/services/urgenceService';
import InterventionForm from '@/app/components/urgences/InterventionForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { InterventionUrgence } from '@/app/types/urgence';

export default function ModifierInterventionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<InterventionUrgence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    urgenceService.getInterventionById(Number(id))
      .then(setData)
      .catch(() => router.push('/urgences/interventions'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <InterventionForm initialData={data} isEdit />;
}
