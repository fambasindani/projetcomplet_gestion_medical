'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { categorieService } from '@/app/services/categorieService';
import CategorieForm from '@/app/components/pharmacie/categorie/CategorieForm';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import type { Categorie } from '@/app/types/categorie';

export default function ModifierCategoriePage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<Categorie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    categorieService.getById(Number(id))
      .then(setData)
      .catch(() => router.push('/pharmacie/categories'))
      .finally(() => setLoading(false));
  }, [id, router]);

  if (loading) return <SkeletonDetails />;
  if (!data) return null;
  return <CategorieForm initialData={data} isEdit />;
}
