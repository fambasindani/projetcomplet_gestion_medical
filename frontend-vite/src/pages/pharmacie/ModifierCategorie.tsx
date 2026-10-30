import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { categorieService } from '@/services/categorieService';
import CategorieForm from '@/components/pharmacie/categorie/CategorieForm';
import SkeletonDetails from '@/ui/SkeletonDetails';
import type { Categorie } from '@/types/categorie';

export default function ModifierCategoriePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState<Categorie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    categorieService.getById(Number(id))
      .then(setData)
      .catch(() => navigate('/pharmacie/categories'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <CategorieForm initialData={data} isEdit />;
}
