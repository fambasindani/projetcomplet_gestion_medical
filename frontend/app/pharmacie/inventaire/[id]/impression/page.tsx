'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PDFViewer } from '@react-pdf/renderer';
import { toast } from 'react-hot-toast';
import { inventaireService } from '@/app/services/inventaireService';
import InventairePV from '@/app/components/pharmacie/inventaire/InventairePV';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Inventaire } from '@/app/types/inventaire';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

export default function ImpressionInventairePage() {
  const { id } = useParams();
  const router = useRouter();
  const [inventaire, setInventaire] = useState<Inventaire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      router.push('/pharmacie/inventaire');
      return;
    }
    inventaireService.getById(Number(id))
      .then(setInventaire)
      .catch((error) => {
        toast.error(extractErrorMessage(error));
        router.push('/pharmacie/inventaire');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

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
