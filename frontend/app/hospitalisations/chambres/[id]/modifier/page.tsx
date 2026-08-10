'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ChambreForm from '@/app/components/chambres/ChambreForm';
import { chambreService } from '@/app/services/chambreService';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import { Chambre } from '@/app/types/chambre';

export default function ModifierChambrePage() {
  const { id } = useParams();
  const [chambre, setChambre] = useState<Chambre | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      chambreService.getById(Number(id))
        .then(setChambre)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (!chambre) return <div className="space-y-6">Chambre non trouvée</div>;

  return <ChambreForm initialData={chambre} isEditing />;
}
