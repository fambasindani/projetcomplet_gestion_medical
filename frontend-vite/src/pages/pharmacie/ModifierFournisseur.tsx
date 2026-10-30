import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fournisseurService } from '@/services/fournisseurService';
import FournisseurForm from '@/components/pharmacie/fournisseurs/FournisseurForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Fournisseur } from '@/types/fournisseur';

export default function ModifierFournisseurPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Fournisseur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fournisseurService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/pharmacie/fournisseurs'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <FournisseurForm initialData={data} isEdit />;
}
