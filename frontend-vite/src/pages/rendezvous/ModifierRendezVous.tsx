import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { rendezvousService } from '@/services/rendezvousService';
import RendezVousForm from '@/components/rendezvous/RendezVousForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { RendezVous } from '@/types/rendezvous';

export default function EditRendezVousPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rendezvousService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/rendezvous'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <RendezVousForm initialData={data} isEdit />;
}
