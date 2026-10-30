import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ChambreForm from '@/components/chambres/ChambreForm';
import { chambreService } from '@/services/chambreService';
import SkeletonDetails from '@/ui/SkeletonDetails';
import { Chambre } from '@/types/chambre';

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
