'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { soinPrescritService } from '@/app/services/soinPrescritService';
import SoinPrescritForm from '@/app/components/prescriptions/SoinPrescritForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { SoinPrescrit } from '@/app/types/soin';

export default function ModifierSoinPrescritPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<SoinPrescrit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soinPrescritService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/prescriptions'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <SoinPrescritForm initialData={data} isEdit />;
}
