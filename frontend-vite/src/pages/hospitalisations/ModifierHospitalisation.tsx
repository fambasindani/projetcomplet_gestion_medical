// app/hospitalisations/[id]/modifier/page.tsx

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { hospitalisationService } from '@/services/hospitalisationService';

import SkeletonDetails from '@/ui/SkeletonDetails';
import HospitalisationForm from '@/components/patients/hospitalisations/HospitalisationForm';
import type { Hospitalisation } from '@/types/hospitalisation';

export default function EditHospitalisationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialData, setInitialData] = useState<Hospitalisation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    hospitalisationService
      .getById(Number(id))
      .then((data) => {
        setInitialData(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Impossible de charger l\'hospitalisation');
        navigate('/hospitalisations');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!initialData) return null;

  // On passe les données existantes et le flag isEditing
  return <HospitalisationForm initialData={initialData} isEditing />;
}