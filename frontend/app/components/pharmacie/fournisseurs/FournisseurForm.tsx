'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaBuilding, FaUser, FaPhone, FaEnvelope, FaGlobe, FaIdCard, FaDollarSign, FaStar } from 'react-icons/fa';
import { FormInput } from '../../common/FormInput';
import { FormTextarea } from '../../common/FormTextarea';
import { FormSelect } from '../../common/FormSelect';
import { fournisseurService } from '@/app/services/fournisseurService';
import { FournisseurCreate, Fournisseur } from '@/app/types/fournisseur';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

interface FournisseurFormProps {
  initialData?: Fournisseur | null;
  isEdit?: boolean;
}

const ouiNonOptions = [
  { value: 'true', label: 'Oui' },
  { value: 'false', label: 'Non' }
];

export default function FournisseurForm({ initialData, isEdit = false }: FournisseurFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FournisseurCreate>(() => initialData ? {
    nomFournisseur: initialData.nomFournisseur,
    contactNom: initialData.contactNom || '',
    contactFonction: initialData.contactFonction || '',
    telephone: initialData.telephone || '',
    email: initialData.email || '',
    adresse: initialData.adresse || '',
    siteWeb: initialData.siteWeb || '',
    siret: initialData.siret || '',
    numeroAgrement: initialData.numeroAgrement || '',
    conditionsPaiement: initialData.conditionsPaiement || '',
    delaiLivraison: initialData.delaiLivraison,
    note: initialData.note,
    actif: initialData.actif,
  } : {
    nomFournisseur: '',
    contactNom: '',
    contactFonction: '',
    telephone: '',
    email: '',
    adresse: '',
    siteWeb: '',
    siret: '',
    numeroAgrement: '',
    conditionsPaiement: '',
    delaiLivraison: null,
    note: null,
    actif: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | null = value;
    if (type === 'number') newValue = value === '' ? null : Number(value);
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nomFournisseur?.trim()) newErrors.nomFournisseur = 'Le nom du fournisseur est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isEdit && initialData?.idFournisseur) {
        await fournisseurService.update(initialData.idFournisseur, formData);
        toast.success('Fournisseur modifié');
      } else {
        await fournisseurService.create(formData);
        toast.success('Fournisseur créé');
      }
      router.push('/pharmacie/fournisseurs');
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
        title={isEdit ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/fournisseurs')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FormInput
              label="Nom du fournisseur *"
              name="nomFournisseur"
              value={formData.nomFournisseur}
              onChange={handleChange}
              required
              error={errors.nomFournisseur}
              icon={<FaBuilding />}
            />
            <FormInput label="Contact (nom)" name="contactNom" value={formData.contactNom || ''} onChange={handleChange} icon={<FaUser />} />
            <FormInput label="Fonction du contact" name="contactFonction" value={formData.contactFonction || ''} onChange={handleChange} />
            <FormInput label="Téléphone" name="telephone" value={formData.telephone || ''} onChange={handleChange} icon={<FaPhone />} />
            <FormInput label="Email" name="email" type="email" value={formData.email || ''} onChange={handleChange} icon={<FaEnvelope />} />
            <FormInput label="Site web" name="siteWeb" value={formData.siteWeb || ''} onChange={handleChange} icon={<FaGlobe />} />
            <FormInput label="SIRET" name="siret" value={formData.siret || ''} onChange={handleChange} icon={<FaIdCard />} />
            <FormInput label="N° Agrément" name="numeroAgrement" value={formData.numeroAgrement || ''} onChange={handleChange} />
            <FormInput label="Conditions de paiement" name="conditionsPaiement" value={formData.conditionsPaiement || ''} onChange={handleChange} icon={<FaDollarSign />} />
            <FormInput label="Délai de livraison (jours)" name="delaiLivraison" type="number" value={formData.delaiLivraison?.toString() || ''} onChange={handleChange} />
            <FormInput label="Note (0-5)" name="note" type="number" step="0.1" min="0" max="5" value={formData.note?.toString() || ''} onChange={handleChange} icon={<FaStar />} />
            <FormSelect
              label="Actif"
              name="actif"
              value={formData.actif ? 'true' : 'false'}
              onChange={(e) => setFormData(prev => ({ ...prev, actif: e.target.value === 'true' }))}
              options={ouiNonOptions}
            />
          </div>

          <FormTextarea
            label="Adresse"
            name="adresse"
            value={formData.adresse || ''}
            onChange={handleChange}
            rows={2}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.push('/pharmacie/fournisseurs')}>Annuler</Button>
            <Button type="submit" disabled={loading} icon={<FaSave />}>
              {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
