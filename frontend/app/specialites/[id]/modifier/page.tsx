'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { specialiteService } from '@/app/services/specialiteService';
import SpecialiteForm from '@/app/components/specialites/SpecialiteForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Specialite } from '@/app/types/specialite';

export default function ModifierSpecialitePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Specialite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    specialiteService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/specialites'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <SpecialiteForm initialData={data} isEdit />;
}
