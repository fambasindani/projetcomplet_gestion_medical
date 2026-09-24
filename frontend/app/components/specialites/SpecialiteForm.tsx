// components/specialites/SpecialiteForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaTag, FaUserTie, FaPhone, FaEnvelope, FaCheckCircle, FaSave } from 'react-icons/fa';
import { FormInput } from '../common/FormInput';
import { FormTextarea } from '../common/FormTextarea';
import { specialiteService } from '@/app/services/specialiteService';
import type { Specialite, SpecialiteCreate } from '@/app/types/specialite';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

interface SpecialiteFormProps {
  initialData?: Specialite | null;
  isEdit?: boolean;
}

const SpecialiteForm: React.FC<SpecialiteFormProps> = ({ initialData, isEdit = false }) => {
  const router = useRouter();
  const [formData, setFormData] = useState<SpecialiteCreate>({
    nomSpecialite: initialData?.nomSpecialite || '',
    description: initialData?.description || '',
    chefService: initialData?.chefService || '',
    telephoneService: initialData?.telephoneService || '',
    emailService: initialData?.emailService || '',
    actif: initialData?.actif ?? true,
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.nomSpecialite?.trim()) newErrors.nomSpecialite = 'Le nom est requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isEdit && initialData?.idSpecialite) {
        await specialiteService.update(initialData.idSpecialite, formData);
        toast.success('Spécialité mise à jour');
      } else {
        await specialiteService.create(formData);
        toast.success('Spécialité ajoutée');
      }
      router.push('/specialites');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title={isEdit ? 'Modifier la spécialité' : 'Ajouter une spécialité'}
      onBack={() => router.push('/specialites')}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection>
          <FormInput
            label="Nom de la spécialité"
            name="nomSpecialite"
            value={formData.nomSpecialite}
            onChange={handleChange}
            required
            error={errors.nomSpecialite}
            icon={<FaTag />}
            placeholder="Ex: Cardiologie"
          />

          <FormInput
            label="Chef de service"
            name="chefService"
            value={formData.chefService}
            onChange={handleChange}
            error={errors.chefService}
            icon={<FaUserTie />}
            placeholder="Dr. Dupont"
          />

          <FormTextarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={errors.description}
            rows={3}
            placeholder="Description de la spécialité..."
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Téléphone"
              name="telephoneService"
              value={formData.telephoneService}
              onChange={handleChange}
              error={errors.telephoneService}
              icon={<FaPhone />}
              placeholder="01 23 45 67 89"
            />
            <FormInput
              label="Email"
              name="emailService"
              type="email"
              value={formData.emailService}
              onChange={handleChange}
              error={errors.emailService}
              icon={<FaEnvelope />}
              placeholder="contact@service.fr"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="actif"
              name="actif"
              checked={formData.actif}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="actif" className="ml-2 flex items-center text-sm text-gray-700">
              <FaCheckCircle className="mr-1 text-green-500" /> Actif
            </label>
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push('/specialites')}
          submitLabel={isEdit ? 'Modifier' : 'Ajouter'}
          loading={loading}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
};

export default SpecialiteForm;
