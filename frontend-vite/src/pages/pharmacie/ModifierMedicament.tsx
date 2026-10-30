
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { medicamentService } from '@/services/medicamentService';
import MedicamentForm from '@/components/pharmacie/medicaments/MedicamentForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Medicament } from '@/types/medicament';

export default function EditMedicamentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Medicament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    medicamentService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/pharmacie/medicaments'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <MedicamentForm initialData={data} isEdit />;
}