'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { factureService } from '@/app/services/factureService';
import PaiementForm from '@/app/components/facturation/PaiementForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Facture } from '@/app/types/facture';

export default function NouveauPaiementPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    factureService.getById(Number(id))
      .then(setData)
      .catch(() => router.push(`/factures/${id}`))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <PaiementForm facture={data} />;
}
