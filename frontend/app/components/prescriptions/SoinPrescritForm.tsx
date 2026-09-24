'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { soinPrescritService } from '@/app/services/soinPrescritService';
import { personnelService } from '@/app/services/personnelService';
import { FormSelect } from '../common/FormSelect';
import { FormInput } from '../common/FormInput';
import { toast } from 'react-hot-toast';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { StatutSoin, SoinPrescrit } from '@/app/types/soin';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

const statutOptions = [
  { value: StatutSoin.Prescrit, label: 'Prescrit' },
  { value: StatutSoin.EnCours, label: 'En cours' },
  { value: StatutSoin.Realise, label: 'Réalisé' },
  { value: StatutSoin.Annule, label: 'Annulé' },
];

interface SoinPrescritFormProps {
  initialData?: SoinPrescrit | null;
  isEdit?: boolean;
}

export default function SoinPrescritForm({ initialData, isEdit = false }: SoinPrescritFormProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const prescriptionId = isEdit && initialData ? initialData.idPrescription : Number(params.id);
  const patientId = isEdit && initialData ? initialData.idPatient : Number(searchParams.get('patient'));
  const returnRoute = `/prescriptions/${prescriptionId}/soins`;

  const [loading, setLoading] = useState(false);
  const [personnels, setPersonnels] = useState<{ idPersonnel: number; nom: string; prenom: string }[]>([]);
  const [form, setForm] = useState(() => initialData ? {
    idPrescription: initialData.idPrescription,
    idPatient: initialData.idPatient,
    idInfirmier: initialData.idInfirmier || 0,
    description: initialData.description,
    instructions: initialData.instructions || '',
    frequence: initialData.frequence || '',
    duree: initialData.duree || '',
    statut: initialData.statut,
  } : {
    idPrescription: prescriptionId,
    idPatient: patientId,
    idInfirmier: 0,
    description: '',
    instructions: '',
    frequence: '',
    duree: '',
    statut: StatutSoin.Prescrit,
  });

  useEffect(() => {
    const fetchPersonnels = async () => {
      try {
        const result = await personnelService.search('', 1, 100);
        const items = result.items.map(p => ({ idPersonnel: p.idPersonnel, nom: p.nom, prenom: p.prenom }));
        setPersonnels(items);
      } catch (error) {
        console.warn('Chargement des personnels impossible', error);
      }
    };
    fetchPersonnels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description.trim()) {
      toast.error('La description est requise');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && initialData) {
        await soinPrescritService.update(initialData.idSoin, form);
        toast.success('Soin modifié');
      } else {
        await soinPrescritService.create(form);
        toast.success('Soin ajouté');
      }
      router.push(returnRoute);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && !initialData) return <SkeletonDetails />;

  return (
    <PageShell
      title={isEdit ? 'Modifier le soin' : 'Ajouter un soin'}
      maxWidth="max-w-6xl"
      onBack={() => router.push(returnRoute)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection>
          <FormInput
            label="Description "
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
          <FormInput
            label="Instructions"
            value={form.instructions}
            onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Fréquence (ex: 2x/jour)"
              value={form.frequence}
              onChange={(e) => setForm({ ...form, frequence: e.target.value })}
            />
            <FormInput
              label="Durée (ex: 5 jours)"
              value={form.duree}
              onChange={(e) => setForm({ ...form, duree: e.target.value })}
            />
          </div>
          <FormSelect
            label="Statut"
            value={form.statut}
            onChange={(e) => setForm({ ...form, statut: e.target.value as StatutSoin })}
            options={statutOptions}
          />
          <FormSelect
            label="Infirmier (optionnel)"
            value={form.idInfirmier}
            onChange={(e) => setForm({ ...form, idInfirmier: Number(e.target.value) })}
            options={[
              { value: 0, label: '-- Sélectionner --' },
              ...personnels.map(p => ({ value: p.idPersonnel, label: `${p.nom} ${p.prenom}` })),
            ]}
          />
        </FormSection>

        <FormActions
          onCancel={() => router.push(returnRoute)}
          submitLabel={isEdit ? 'Modifier' : 'Ajouter'}
          loading={loading}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
