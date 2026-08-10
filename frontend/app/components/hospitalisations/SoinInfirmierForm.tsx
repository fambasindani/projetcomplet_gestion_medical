'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { soinInfirmierService } from '@/app/services/soinInfirmierService';
import { hospitalisationService } from '@/app/services/hospitalisationService';
import { PersonnelSearchSelect } from '@/app/components/common/PersonnelSearchSelect';
import { FormInput } from '../common/FormInput';
import { FormTextarea } from '../common/FormTextarea';
import { FormSelect } from '../common/FormSelect';
import { toast } from 'react-hot-toast';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { SoinInfirmier, SoinInfirmierRequest } from '@/app/types/soin';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

const LIST_ROUTE = '/hospitalisations/soins';

interface SoinInfirmierFormProps {
  initialData?: SoinInfirmier | null;
  isEdit?: boolean;
}

export default function SoinInfirmierForm({ initialData, isEdit = false }: SoinInfirmierFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hospitalisations, setHospitalisations] = useState<{ idHospitalisation: number; patientNom: string }[]>([]);
  const [form, setForm] = useState<SoinInfirmierRequest>(() => initialData ? {
    idHospitalisation: initialData.idHospitalisation,
    idInfirmier: initialData.idInfirmier,
    dateSoin: initialData.dateSoin.slice(0, 16),
    typeSoin: initialData.typeSoin,
    description: initialData.description || '',
    observations: initialData.observations || '',
    signatureInfirmier: initialData.signatureInfirmier,
  } : {
    idHospitalisation: 0,
    idInfirmier: 0,
    dateSoin: new Date().toISOString().slice(0, 16),
    typeSoin: '',
    description: '',
    observations: '',
    signatureInfirmier: false,
  });

  // Charger la liste des hospitalisations pour le sélecteur
  useEffect(() => {
    hospitalisationService.getSimpleList().then(setHospitalisations).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.idHospitalisation) {
      toast.error('Veuillez sélectionner une hospitalisation');
      return;
    }
    if (!form.typeSoin) {
      toast.error('Le type de soin est requis');
      return;
    }
    if (!form.idInfirmier) {
      toast.error('Veuillez sélectionner un infirmier');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        ...form,
        dateSoin: new Date(form.dateSoin).toISOString(),
      };
      if (isEdit && initialData) {
        await soinInfirmierService.update(initialData.idSoin, payload);
        toast.success('Soin modifié');
      } else {
        await soinInfirmierService.create(payload);
        toast.success('Soin ajouté');
      }
      router.push(LIST_ROUTE);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && !initialData) return <SkeletonDetails />;

  const hospitalisationOptions = [
    { value: 0, label: '-- Sélectionner --' },
    ...hospitalisations.map(h => ({
      value: h.idHospitalisation,
      label: `#${h.idHospitalisation} - ${h.patientNom}`,
    })),
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Modifier le soin' : 'Ajouter un soin'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push(LIST_ROUTE)}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-4">
          <FormSelect
            label="Hospitalisation "
            value={form.idHospitalisation}
            onChange={(e) => setForm({ ...form, idHospitalisation: Number(e.target.value) })}
            options={hospitalisationOptions}
            required
          />

          <FormInput
            label="Type de soin "
            value={form.typeSoin}
            onChange={(e) => setForm({ ...form, typeSoin: e.target.value })}
            required
          />
          <FormInput
            label="Date et heure du soin "
            type="datetime-local"
            value={form.dateSoin}
            onChange={(e) => setForm({ ...form, dateSoin: e.target.value })}
            required
          />

          <PersonnelSearchSelect
            value={form.idInfirmier}
            onChange={(id) => setForm({ ...form, idInfirmier: id || 0 })}
            label="Infirmier "
            required
            placeholder="Rechercher un infirmier..."
          />

          <FormTextarea
            label="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
          />
          <FormTextarea
            label="Observations"
            value={form.observations}
            onChange={(e) => setForm({ ...form, observations: e.target.value })}
            rows={2}
          />
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="signature"
              checked={form.signatureInfirmier}
              onChange={(e) => setForm({ ...form, signatureInfirmier: e.target.checked })}
              className="h-4 w-4"
            />
            <label htmlFor="signature" className="text-sm text-gray-700">Signature infirmier</label>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="secondary" onClick={() => router.push(LIST_ROUTE)}>Annuler</Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
          </Button>
        </div>
      </form>
    </div>
  );
}
