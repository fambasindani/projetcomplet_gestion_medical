import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { factureService } from '@/services/factureService';
import PaiementForm from '@/components/facturation/PaiementForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Facture } from '@/types/facture';

export default function NouveauPaiementPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Facture | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    factureService.getById(Number(id))
      .then(setData)
      .catch(() => navigate(`/factures/${id}`))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <PaiementForm facture={data} />;
}
