'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { constanteService } from '@/app/services/constanteService';
import ConstanteForm from '@/app/components/patients/hospitalisations/ConstanteForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Constante } from '@/app/types/constante';

export default function EditConstantePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Constante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    constanteService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/patients/hospitalisations'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <ConstanteForm initialData={data} isEdit />;
}
