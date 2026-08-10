'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { commandeService } from '@/app/services/commandeService';
import CommandeForm from '@/app/components/pharmacie/commande/CommandeForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { CommandeFournisseur } from '@/app/types/commande';

export default function ModifierCommandePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<CommandeFournisseur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    commandeService.getById(Number(id))
      .then(setData)
      .catch(() => {
        router.push('/pharmacie/commandes');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;

  return <CommandeForm initialData={data} isEditing />;
}