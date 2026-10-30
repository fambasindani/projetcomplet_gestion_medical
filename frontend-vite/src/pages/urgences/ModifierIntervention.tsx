import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urgenceService } from '@/services/urgenceService';
import InterventionForm from '@/components/urgences/InterventionForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { InterventionUrgence } from '@/types/urgence';

export default function ModifierInterventionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<InterventionUrgence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    urgenceService.getInterventionById(Number(id))
      .then(setData)
      .catch(() => navigate('/urgences/interventions'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <InterventionForm initialData={data} isEdit />;
}
