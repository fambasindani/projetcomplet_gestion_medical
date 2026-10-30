import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { soinPrescritService } from '@/services/soinPrescritService';
import SoinPrescritForm from '@/components/prescriptions/SoinPrescritForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { SoinPrescrit } from '@/types/soin';

export default function ModifierSoinPrescritPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<SoinPrescrit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soinPrescritService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/prescriptions'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <SoinPrescritForm initialData={data} isEdit />;
}
