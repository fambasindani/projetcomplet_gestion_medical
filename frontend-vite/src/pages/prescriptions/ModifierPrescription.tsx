import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { prescriptionService } from '@/services/prescriptionService';
import PrescriptionForm from '@/components/prescriptions/PrescriptionForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Prescription } from '@/types/prescription';

export default function EditPrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    prescriptionService.getById(Number(id)).then(setData).catch(() => navigate('/prescriptions')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <PrescriptionForm initialData={data} isEditing />;
}