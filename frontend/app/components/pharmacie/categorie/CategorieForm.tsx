'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { FormInput } from '../../common/FormInput';
import { FormTextarea } from '../../common/FormTextarea';
import { categorieService } from '@/app/services/categorieService';
import { CategorieCreate, Categorie } from '@/app/types/categorie';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

interface CategorieFormProps {
  initialData?: Categorie | null;
  isEdit?: boolean;
}

export default function CategorieForm({ initialData, isEdit = false }: CategorieFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CategorieCreate>(() => initialData ? {
    nomCategorie: initialData.nomCategorie,
    description: initialData.description || '',
    codeCategorie: initialData.codeCategorie || '',
  } : {
    nomCategorie: '',
    description: '',
    codeCategorie: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.nomCategorie?.trim()) newErrors.nomCategorie = 'Le nom est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && initialData?.idCategorie) {
        await categorieService.update(initialData.idCategorie, formData);
        toast.success('Catégorie mise à jour');
      } else {
        await categorieService.create(formData);
        toast.success('Catégorie créée');
      }
      router.push('/pharmacie/categories');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && !initialData) return <SkeletonDetails />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/categories')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-6xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 space-y-4">
          <FormInput
            label="Nom de la catégorie"
            name="nomCategorie"
            value={formData.nomCategorie}
            onChange={handleChange}
            required
            error={errors.nomCategorie}
          />
          <FormInput
            label="Code catégorie"
            name="codeCategorie"
            value={formData.codeCategorie}
            onChange={handleChange}
          />
          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.push('/pharmacie/categories')}>Annuler</Button>
            <Button type="submit" disabled={loading} icon={<FaSave />}>
              {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
