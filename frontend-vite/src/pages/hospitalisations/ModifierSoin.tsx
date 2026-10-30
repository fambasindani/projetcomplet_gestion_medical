import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { soinInfirmierService } from '@/services/soinInfirmierService';
import SoinInfirmierForm from '@/components/hospitalisations/SoinInfirmierForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { SoinInfirmier } from '@/types/soin';

export default function ModifierSoinPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<SoinInfirmier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    soinInfirmierService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/hospitalisations/soins'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <SoinInfirmierForm initialData={data} isEdit />;
}
