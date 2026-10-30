import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { specialiteService } from '@/services/specialiteService';
import SpecialiteForm from '@/components/specialites/SpecialiteForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Specialite } from '@/types/specialite';

export default function ModifierSpecialitePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Specialite | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    specialiteService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/specialites'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <SpecialiteForm initialData={data} isEdit />;
}
