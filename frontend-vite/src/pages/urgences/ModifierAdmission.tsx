import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urgenceService } from '@/services/urgenceService';
import AdmissionForm from '@/components/urgences/AdmissionForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { AdmissionUrgence } from '@/types/urgence';

export default function ModifierAdmissionPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<AdmissionUrgence | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    urgenceService.getAdmissionById(Number(id))
      .then(setData)
      .catch(() => navigate('/urgences/admissions'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <AdmissionForm initialData={data} isEdit />;
}
