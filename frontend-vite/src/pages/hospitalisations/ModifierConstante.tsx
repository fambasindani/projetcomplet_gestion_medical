import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { constanteService } from '@/services/constanteService';
import ConstanteForm from '@/components/patients/hospitalisations/ConstanteForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Constante } from '@/types/constante';

export default function EditConstantePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Constante | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    constanteService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/patients/hospitalisations'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <ConstanteForm initialData={data} isEdit />;
}
