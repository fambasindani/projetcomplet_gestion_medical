// app/hospitalisations/[id]/modifier/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { hospitalisationService } from '@/app/services/hospitalisationService';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import HospitalisationForm from '@/app/components/patients/hospitalisations/HospitalisationForm';
import type { Hospitalisation } from '@/app/types/hospitalisation';

export default function EditHospitalisationPage() {
  const { id } = useParams();
  const router = useRouter();
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
        router.push('/hospitalisations');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!initialData) return null;

  // On passe les données existantes et le flag isEditing
  return <HospitalisationForm initialData={initialData} isEditing />;
}
