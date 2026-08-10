'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fournisseurService } from '@/app/services/fournisseurService';
import FournisseurForm from '@/app/components/pharmacie/fournisseurs/FournisseurForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Fournisseur } from '@/app/types/fournisseur';

export default function ModifierFournisseurPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Fournisseur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fournisseurService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/pharmacie/fournisseurs'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <FournisseurForm initialData={data} isEdit />;
}
