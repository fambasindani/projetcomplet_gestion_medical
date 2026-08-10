'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { consultationService } from '@/app/services/consultationService';
import ConsultationForm from '@/app/components/consultation/ConsultationForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Consultation } from '@/app/types/consultation';

export default function EditConsultationPage() {
  const { id } = useParams();
  const router = useRouter();
  const [initialData, setInitialData] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      consultationService
        .getById(Number(id))
        .then((data) => {
          // Transformer les dates pour le format du formulaire (datetime-local et date)
          const formatted = {
            ...data,
            dateConsultation: data.dateConsultation ? data.dateConsultation.slice(0, 16) : '',
            arretTravailDebut: data.arretTravailDebut ? data.arretTravailDebut.slice(0, 10) : '',
            arretTravailFin: data.arretTravailFin ? data.arretTravailFin.slice(0, 10) : '',
            prochainRdv: data.prochainRdv ? data.prochainRdv.slice(0, 16) : '',
          };
          setInitialData(formatted);
        })
        .catch(() => {
          toast.error('Impossible de charger la consultation');
          router.push('/consultations');
        })
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!initialData) return null;

  return (
    <div className="space-y-6">
      <ConsultationForm
        initialData={initialData}
        isEdit={true}
        id={Number(id)}
      />
    </div>
  );
}