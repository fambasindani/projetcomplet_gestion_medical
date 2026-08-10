'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { lotService } from '@/app/services/lotService';
import LotForm from '@/app/components/pharmacie/lots/LotForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { LotMedicament } from '@/app/types/lot';

export default function ModifierLotPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<LotMedicament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    lotService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/pharmacie/lots'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <LotForm initialData={data} isEdit />;
}
