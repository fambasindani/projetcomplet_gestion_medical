'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { prescriptionService } from '@/app/services/prescriptionService';
import PrescriptionForm from '@/app/components/prescriptions/PrescriptionForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Prescription } from '@/app/types/prescription';

export default function EditPrescription() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionService.getById(Number(id)).then(setData).catch(() => router.push('/prescriptions')).finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <PrescriptionForm initialData={data} isEditing />;
}