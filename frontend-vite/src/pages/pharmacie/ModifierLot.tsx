
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lotService } from '@/services/lotService';
import LotForm from '@/components/pharmacie/lots/LotForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { LotMedicament } from '@/types/lot';

export default function ModifierLotPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<LotMedicament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    lotService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/pharmacie/lots'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <LotForm initialData={data} isEdit />;
}