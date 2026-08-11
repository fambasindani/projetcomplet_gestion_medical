'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFViewer } from '@react-pdf/renderer';
import { toast } from 'react-hot-toast';
import { examenService } from '@/app/services/examenService';
import ExamensPDF from './ExamensPDF';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Examen } from '@/app/types/examen';

export default function ImpressionExamen() {
  const { id } = useParams();
  const router = useRouter();
  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push('/examens/liste');
      return;
    }
    examenService
      .getById(Number(id))
      .then((data) => {
        setExamen(data);
        const hasResultat = !!(data.resultat || data.interpretation || data.compteRendu || data.conclusion || data.anomalies);
        if (!hasResultat) {
          toast.error('Résultat pas disponible');
        }
      })
      .catch(() => {
        toast.error('Erreur de chargement');
        router.push('/examens/liste');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!examen) return <div className="p-6 text-center">Examen introuvable.</div>;

  return (
    <div className="h-screen w-full p-4 bg-gray-50">
      <PDFViewer width="100%" height="100%" showToolbar={true}>
        <ExamensPDF
          examens={[examen]}
          titre={`Examen ${examen.numeroExamen} - ${examen.typeExamen}`}
          patientNom={examen.patientNom}
          patientPrenom=""
          medecinNom={examen.medecinNom}
          medecinPrenom=""
        />
      </PDFViewer>
    </div>
  );
}
