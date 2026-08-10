'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { soinInfirmierService } from '@/app/services/soinInfirmierService';
import SoinInfirmierForm from '@/app/components/hospitalisations/SoinInfirmierForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { SoinInfirmier } from '@/app/types/soin';

export default function ModifierSoinPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<SoinInfirmier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soinInfirmierService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/hospitalisations/soins'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <SoinInfirmierForm initialData={data} isEdit />;
}
