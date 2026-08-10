// app/components/rendezvous/RendezVousForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaCalendarAlt, FaClipboardList, FaBell, FaArrowLeft, FaSave } from 'react-icons/fa';

import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';
import { PatientSearchSelect } from '../common/PatientSearchSelect';
import { MedecinSearchSelect } from '../common/MedecinSearchSelect';

import { rendezvousService } from '@/app/services/rendezvousService';
import { RendezVousCreate, StatutRendezVous } from '@/app/types/rendezvous';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

interface RendezVousFormProps {
  initialData?: (RendezVousCreate & { idRdv?: number }) | null;
  isEdit?: boolean;
}

const statutOptions = Object.values(StatutRendezVous).map((s) => ({
  value: s,
  label: s,
}));

const typeOptions = [
  { value: 'Consultation générale', label: 'Consultation générale' },
  { value: 'Consultation spécialisée', label: 'Consultation spécialisée' },
  { value: 'Contrôle', label: 'Contrôle' },
  { value: 'Urgence', label: 'Urgence' },
];

// Génère une date par défaut dans le futur (+4 heures, +2 minutes)
const getDefaultDateTime = (): string => {
  const future = new Date();
  future.setHours(future.getHours() + 4);
  future.setMinutes(future.getMinutes() + 2, 0);
  return future.toISOString().slice(0, 16);
};

export default function RendezVousForm({ initialData, isEdit = false }: RendezVousFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<RendezVousCreate>>(() => initialData?.idRdv ? {
    idPatient: initialData.idPatient,
    idMedecin: initialData.idMedecin,
    dateRdv: new Date(initialData.dateRdv).toISOString().slice(0, 16),
    motif: initialData.motif || '',
    statut: initialData.statut,
    typeConsultation: initialData.typeConsultation || '',
    dureeEstimee: initialData.dureeEstimee || 30,
    notesPreliminaires: initialData.notesPreliminaires || '',
    rappelEnvoye: initialData.rappelEnvoye || false,
  } : {
    idPatient: null,
    idMedecin: null,
    dateRdv: getDefaultDateTime(),
    motif: '',
    statut: StatutRendezVous.Programme,
    typeConsultation: '',
    dureeEstimee: 30,
    notesPreliminaires: '',
    rappelEnvoye: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handlePatientChange = (id: number | null) => {
    setFormData((prev) => ({ ...prev, idPatient: id }));
    if (errors.idPatient) setErrors((prev) => ({ ...prev, idPatient: '' }));
  };

  const handleMedecinChange = (id: number | null) => {
    setFormData((prev) => ({ ...prev, idMedecin: id }));
    if (errors.idMedecin) setErrors((prev) => ({ ...prev, idMedecin: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.idPatient) newErrors.idPatient = 'Le patient est obligatoire';
    if (!formData.idMedecin) newErrors.idMedecin = 'Le médecin est obligatoire';
    if (!formData.dateRdv) newErrors.dateRdv = 'La date du rendez-vous est obligatoire';
    else {
      const selected = new Date(formData.dateRdv);
      if (selected <= new Date()) {
        newErrors.dateRdv = 'La date doit être dans le futur';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      if (isEdit && initialData?.idRdv) {
        await rendezvousService.update(initialData.idRdv, formData);
        toast.success('Rendez-vous modifié avec succès');
      } else {
        await rendezvousService.create(formData as RendezVousCreate);
        toast.success('Rendez-vous créé avec succès');
      }
      router.push('/rendezvous');
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || 'Erreur lors de l’enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && !initialData) return <SkeletonDetails />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/rendezvous')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatientSearchSelect
              value={formData.idPatient ?? null}
              onChange={handlePatientChange}
              error={errors.idPatient}
              required
            />
            <MedecinSearchSelect
              value={formData.idMedecin ?? null}
              onChange={handleMedecinChange}
              error={errors.idMedecin}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date et heure"
              name="dateRdv"
              type="datetime-local"
              value={formData.dateRdv || ''}
              onChange={handleChange}
              required
              error={errors.dateRdv}
              icon={<FaCalendarAlt />}
            />
            <FormInput
              label="Durée estimée (minutes)"
              name="dureeEstimee"
              type="number"
              value={formData.dureeEstimee?.toString() || ''}
              onChange={handleChange}
              icon={<FaClipboardList />}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              label="Statut"
              name="statut"
              value={formData.statut || ''}
              onChange={handleChange}
              options={statutOptions}
            />
            <FormSelect
              label="Type de consultation"
              name="typeConsultation"
              value={formData.typeConsultation || ''}
              onChange={handleChange}
              options={typeOptions}
            />
          </div>

          <FormTextarea
            label="Motif"
            name="motif"
            value={formData.motif || ''}
            onChange={handleChange}
            rows={2}
          />

          <FormTextarea
            label="Notes préliminaires"
            name="notesPreliminaires"
            value={formData.notesPreliminaires || ''}
            onChange={handleChange}
            rows={2}
          />

          <div className="flex items-center">
            <input
              id="rappelEnvoye"
              name="rappelEnvoye"
              type="checkbox"
              checked={formData.rappelEnvoye || false}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="rappelEnvoye" className="ml-2 flex items-center text-sm text-gray-700">
              <FaBell className="mr-1 text-indigo-500" /> Envoyer un rappel
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="secondary" onClick={() => router.push('/rendezvous')}>Annuler</Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </div>
  );
}
