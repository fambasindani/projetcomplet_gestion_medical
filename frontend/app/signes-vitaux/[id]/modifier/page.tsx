'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import SigneVitalForm from '@/app/components/signesvitaux/SigneVitalForm';
import { signeVitalService } from '@/app/services/signeVitalService';
import { SigneVitalCreate } from '@/app/types/signeVital';
import SkeletonDetails from '@/app/ui/SkeletonDetails';

export default function Page() {
  const { id } = useParams();
  const [data, setData] = useState<SigneVitalCreate & { idSigneVital?: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      signeVitalService.getById(Number(id))
        .then((sv) => setData({
          idSigneVital: sv.idSigneVital,
          idPatient: sv.idPatient,
          idPersonnel: sv.idPersonnel,
          dateMesure: sv.dateMesure,
          poids: sv.poids,
          taille: sv.taille,
          temperature: sv.temperature,
          pouls: sv.pouls,
          pressionSystolique: sv.pressionSystolique,
          pressionDiastolique: sv.pressionDiastolique,
          saturation: sv.saturation,
          frequenceRespiratoire: sv.frequenceRespiratoire,
          glycemie: sv.glycemie,
          douleurEchelle: sv.douleurEchelle,
          prisePar: sv.prisePar ?? '',
          observations: sv.observations ?? '',
        }))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (!data) return <div className="space-y-6 text-center">Mesure non trouvée</div>;

  return <SigneVitalForm initialData={data} isEditing />;
}
