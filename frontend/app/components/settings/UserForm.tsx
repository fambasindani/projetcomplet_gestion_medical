// app/components/settings/UserForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaUser, FaLock, FaUserTag } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { PersonnelSearchSelect } from '@/app/components/common/PersonnelSearchSelect';
import { userService } from '@/app/services/userService';
import { User, UserRole, UserUpdate } from '@/app/types/user';
import { toast } from 'react-hot-toast';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

interface UserFormProps {
  initialData?: User | null;
  isEdit?: boolean;
}

const roleOptions = [
  { value: '', label: '-- Choisir un rôle --' },
  { value: 'ADMIN', label: 'Administrateur' },
  { value: 'MEDECIN', label: 'Médecin' },
  { value: 'SECRETAIRE', label: 'Secrétaire' },
  { value: 'PHARMACIEN', label: 'Pharmacien' },
  { value: 'INFIRMIER', label: 'Infirmier' },
  { value: 'LABORANTIN', label: 'Laborantin' },
  { value: 'RH', label: 'Ressources humaines' },
  { value: 'PATIENT', label: 'Patient' },
];

export default function UserForm({ initialData, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => ({
    id: initialData?.id ?? 0,
    personnelId: initialData?.personnelId ?? 0,
    email: initialData?.email ?? '',
    password: '',
    confirmPassword: '',
    role: (initialData?.role ?? '') as UserRole | '',
    isActive: initialData?.actif ?? true,
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personnelError, setPersonnelError] = useState('');

  const handlePersonnelChange = (id: number | null, _nom?: string, _prenom?: string, email?: string) => {
    setFormData((prev) => ({
      ...prev,
      personnelId: id || 0,
      email: email || prev.email,
    }));
    if (id) setPersonnelError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.personnelId) newErrors.personnelId = 'Sélectionnez un personnel';
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!formData.role) newErrors.role = 'Le rôle est requis';
    if (!initialData) {
      if (!formData.password) newErrors.password = 'Mot de passe requis';
      else if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    } else if (formData.password) {
      if (formData.password.length < 6) newErrors.password = 'Minimum 6 caractères';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }
    setErrors(newErrors);
    setPersonnelError(newErrors.personnelId || '');
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (initialData) {
        const payload: UserUpdate = {
          id: formData.id,
          email: formData.email,
          role: formData.role as UserRole,
          isActive: formData.isActive,
          personnelId: formData.personnelId || undefined,
        };
        if (formData.password) {
          payload.password = formData.password;
          payload.confirmPassword = formData.confirmPassword;
        }
        await userService.update(initialData.id, payload);
        toast.success('Utilisateur modifié');
      } else {
        await userService.create({
          personnelId: formData.personnelId,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role as UserRole,
        });
        toast.success('Utilisateur créé');
      }
      router.push('/settings/utilisateurs');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && !initialData) return <SkeletonDetails />;

  return (
    <PageShell
      title={isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
      subtitle="Un compte est lié à un membre du personnel."
      onBack={() => router.push('/settings/utilisateurs')}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Compte utilisateur" icon={<FaUser />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <PersonnelSearchSelect
                value={formData.personnelId}
                onChange={handlePersonnelChange}
                label="Personnel rattaché"
                required
                error={personnelError}
              />
            </div>
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
              placeholder="prenom.nom@hopital.fr"
            />
            <FormSelect
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
              required
              error={errors.role}
            />
          </div>
          <label className="flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <FaUserTag className="text-slate-400" /> Compte actif
          </label>
        </FormSection>

        <FormSection
          title="Sécurité"
          icon={<FaLock />}
          description={initialData ? 'Laisser vide pour conserver le mot de passe actuel.' : undefined}
        >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <FormInput
              label={initialData ? 'Nouveau mot de passe' : 'Mot de passe'}
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required={!initialData}
              error={errors.password}
              placeholder="••••••••"
            />
            <FormInput
              label="Confirmer le mot de passe"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required={!initialData}
              error={errors.confirmPassword}
              placeholder="••••••••"
            />
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push('/settings/utilisateurs')}
          submitLabel={isEdit ? 'Enregistrer' : 'Créer l\'utilisateur'}
          loading={loading}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
