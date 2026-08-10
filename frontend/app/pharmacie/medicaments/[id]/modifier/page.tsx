'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { medicamentService } from '@/app/services/medicamentService';
import MedicamentForm from '@/app/components/pharmacie/medicaments/MedicamentForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Medicament } from '@/app/types/medicament';

export default function EditMedicamentPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Medicament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicamentService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/pharmacie/medicaments'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <MedicamentForm initialData={data} isEdit />;
}