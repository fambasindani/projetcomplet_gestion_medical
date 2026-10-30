import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { commandeService } from '@/services/commandeService';
import CommandeForm from '@/components/pharmacie/commande/CommandeForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { CommandeFournisseur } from '@/types/commande';

export default function ModifierCommandePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<CommandeFournisseur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    commandeService.getById(Number(id))
      .then(setData)
      .catch(() => {
        navigate('/pharmacie/commandes');
      })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;

  return <CommandeForm initialData={data} isEditing />;
}