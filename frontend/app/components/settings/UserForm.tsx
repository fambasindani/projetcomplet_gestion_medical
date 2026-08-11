// app/components/settings/UserForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaSave } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { PersonnelSearchSelect } from '@/app/components/common/PersonnelSearchSelect';
import { userService } from '@/app/services/userService';
import { User, UserRole, UserUpdate } from '@/app/types/user';
import { toast } from 'react-hot-toast';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

interface UserFormProps {
  initialData?: User | null;
  isEdit?: boolean;
}

const roleOptions = [
  { value: 'ADMIN', label: 'Admin' },
  { value: 'PHARMACIEN', label: 'Pharmacien' },
  { value: 'MEDECIN', label: 'Médecin' },
  { value: 'SECRETAIRE', label: 'Secrétaire' },
];

export default function UserForm({ initialData, isEdit = false }: UserFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(() => initialData ? {
    id: initialData.id,
    personnelId: initialData.personnelId || 0,
    email: initialData.email,
    password: '',
    confirmPassword: '',
    role: initialData.role,
    isActive: initialData.actif,
  } : {
    id: 0,
    personnelId: 0,
    email: '',
    password: '',
    confirmPassword: '',
    role: 'PHARMACIEN' as UserRole,
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [personnelError, setPersonnelError] = useState('');

  const handlePersonnelChange = (id: number | null, nom?: string, prenom?: string, email?: string) => {
    setFormData(prev => ({
      ...prev,
      personnelId: id || 0,
      email: email || '',
    }));
    if (id) setPersonnelError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.personnelId) newErrors.personnelId = 'Sélectionnez un personnel';
    if (!formData.email) newErrors.email = 'Email requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email invalide';
    if (!initialData) {
      // en création : password obligatoire
      if (!formData.password) newErrors.password = 'Mot de passe requis';
      else if (formData.password.length < 4) newErrors.password = 'Minimum 4 caractères';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    } else if (formData.password) {
      // en modification : si un nouveau mot de passe est saisi, on vérifie la confirmation
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
        // Modification
        const payload: UserUpdate = {
          id: formData.id,
          email: formData.email,
          role: formData.role,
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
        // Création
        await userService.create({
          personnelId: formData.personnelId,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          role: formData.role,
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
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/settings/utilisateurs')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
          <div className="space-y-4">
            <PersonnelSearchSelect
              value={formData.personnelId}
              onChange={handlePersonnelChange}
              label="Personnel"
              required
              error={personnelError}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              error={errors.email}
            />
            {!initialData && (
              <>
                <FormInput
                  label="Mot de passe"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  error={errors.password}
                />
                <FormInput
                  label="Confirmer le mot de passe"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  error={errors.confirmPassword}
                />
              </>
            )}
            {initialData && (
              <>
                <FormInput
                  label="Nouveau mot de passe (laisser vide pour ne pas changer)"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                />
                <FormInput
                  label="Confirmer"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={errors.confirmPassword}
                />
              </>
            )}
            <FormSelect
              label="Rôle *"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roleOptions}
            />
            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">Utilisateur actif</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="secondary" onClick={() => router.push('/settings/utilisateurs')}>Annuler</Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </div>
  );
}
