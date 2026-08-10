'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { urgenceService } from '@/app/services/urgenceService';
import AdmissionForm from '@/app/components/urgences/AdmissionForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { AdmissionUrgence } from '@/app/types/urgence';

export default function ModifierAdmissionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<AdmissionUrgence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    urgenceService.getAdmissionById(Number(id))
      .then(setData)
      .catch(() => router.push('/urgences/admissions'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <AdmissionForm initialData={data} isEdit />;
}
