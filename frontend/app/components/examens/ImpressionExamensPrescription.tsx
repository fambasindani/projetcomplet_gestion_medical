'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFViewer } from '@react-pdf/renderer';
import { examenService } from '@/app/services/examenService';
import { prescriptionService } from '@/app/services/prescriptionService';
import ExamensPDF from './ExamensPDF';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Examen } from '@/app/types/examen';
import type { Prescription } from '@/app/types/prescription';

export default function ImpressionExamensPrescription() {
  const params = useParams();
  const router = useRouter();

  // Le nom du dossier dynamique peut être [id] ou [prescriptionId]
  const prescriptionId = (params.prescriptionId || params.id) as string;

  const [examens, setExamens] = useState<Examen[]>([]);
  const [prescription, setPrescription] = useState<Prescription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!prescriptionId) {
      router.push('/examens/liste');
      return;
    }

    const fetchData = async () => {
      try {
        const [examensData, prescriptionData] = await Promise.all([
          examenService.getByPrescription(Number(prescriptionId)),
          prescriptionService.getById(Number(prescriptionId)),
        ]);
        setExamens(examensData);
        setPrescription(prescriptionData);
      } catch (error) {
        console.error('Erreur de chargement :', error);
        router.push('/examens/liste');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [prescriptionId, router]);

  if (loading) {
    return <SkeletonDetails />;
  }

  if (!prescription || examens.length === 0) {
    return <div className="p-6 text-center">Aucun examen trouvé pour cette prescription.</div>;
  }

  return (
    <div className="h-screen w-full p-4 bg-gray-50">
      <PDFViewer width="100%" height="100%" showToolbar={true}>
        <ExamensPDF
          examens={examens}
          titre={`Ordonnance d'examens - Prescription ${prescription.numeroPrescription}`}
          patientNom={prescription.patientNom}
          patientPrenom={prescription.patientPrenom}
          medecinNom={prescription.medecinNom}
          medecinPrenom={prescription.medecinPrenom}
        />
      </PDFViewer>
    </div>
  );
}