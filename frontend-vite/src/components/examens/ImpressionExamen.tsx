import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { examenService } from '@/services/examenService';
import ExamensPDF from './ExamensPDF';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Examen } from '@/types/examen';

export default function ImpressionExamen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/examens/liste');
      return;
    }
    examenService
      .getById(Number(id))
      .then((data) => {
        setExamen(data);
      })
      .catch(() => {
        console.error('Chargement échoué');
        navigate('/examens/liste');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!examen) return <div className="p-6 text-center">Examen introuvable.</div>;

  return (
    <div className="h-screen w-full p-4 bg-slate-50">
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
