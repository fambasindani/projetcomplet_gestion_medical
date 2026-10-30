import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PDFViewer } from '@react-pdf/renderer';
import { toast } from '@/utils/toast';
import { inventaireService } from '@/services/inventaireService';
import InventairePV from '@/components/pharmacie/inventaire/InventairePV';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Inventaire } from '@/types/inventaire';
import { extractErrorMessage } from '@/utils/extractErrorMessage';

export default function ImpressionInventairePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inventaire, setInventaire] = useState<Inventaire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      navigate('/pharmacie/inventaire');
      return;
    }
    inventaireService.getById(Number(id))
      .then(setInventaire)
      .catch((error) => {
        toast.error(extractErrorMessage(error));
        navigate('/pharmacie/inventaire');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!inventaire) return <div className="p-6 text-center">Inventaire introuvable.</div>;

  return (
    <div className="h-screen w-full bg-slate-50 p-4">
      <PDFViewer width="100%" height="100%" showToolbar={true}>
        <InventairePV inventaire={inventaire} />
      </PDFViewer>
    </div>
  );
}
