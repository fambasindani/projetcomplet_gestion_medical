import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { consultationService } from '@/services/consultationService';
import ConsultationForm from '@/components/consultation/ConsultationForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Consultation } from '@/types/consultation';

export default function EditConsultationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
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
          navigate('/consultations');
        })
        .finally(() => setLoading(false));
    }
  }, [id, navigate]);

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