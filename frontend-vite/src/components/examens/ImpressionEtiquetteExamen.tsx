import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer, pdf } from '@react-pdf/renderer';
import { toast } from '@/utils/toast';
import { FaPrint, FaDownload } from 'react-icons/fa';
import { examenService } from '@/services/examenService';
import EtiquetteExamenPDF from './EtiquetteExamenPDF';
import SkeletonDetails from '@/ui/SkeletonDetails';
import Button from '@/ui/Button';
import type { Examen } from '@/types/examen';

export default function ImpressionEtiquetteExamen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) {
      navigate('/examens/liste');
      return;
    }
    examenService
      .getById(Number(id))
      .then(setExamen)
      .catch(() => {
        console.error('Chargement échoué');
        navigate('/examens/liste');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const telecharger = async () => {
    if (!examen) return;
    setDownloading(true);
    try {
      const blob = await pdf(<EtiquetteExamenPDF examens={[examen]} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `etiquette-${examen.numeroExamen}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de generer l'etiquette");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!examen) return <div className="p-6 text-center">Examen introuvable.</div>;

  return (
    <div className="flex h-screen w-full flex-col gap-3 bg-slate-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Etiquette examen</h1>
          <p className="text-xs text-slate-500">
            Format autocollant — imprimante matricielle / thermique (70 x 40 mm)
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon={<FaDownload />} onClick={telecharger} disabled={downloading}>
            {downloading ? 'Generation...' : 'Telecharger le PDF'}
          </Button>
          <Button variant="secondary" icon={<FaPrint />} onClick={() => navigate(`/examens/${examen.idExamen}/impression`)}>
            Resultats (A4)
          </Button>
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <PDFViewer width="100%" height="100%" showToolbar={true}>
          <EtiquetteExamenPDF examens={[examen]} />
        </PDFViewer>
      </div>
    </div>
  );
}