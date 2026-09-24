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
import ActeAutocomplete from '../facturation/ActeAutocomplete';
import { toast } from 'react-hot-toast';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { SoinInfirmier, SoinInfirmierRequest } from '@/app/types/soin';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

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
    idActeCatalogue: initialData.idActeCatalogue ?? null,
    description: initialData.description || '',
    observations: initialData.observations || '',
    signatureInfirmier: initialData.signatureInfirmier,
  } : {
    idHospitalisation: 0,
    idInfirmier: 0,
    dateSoin: new Date().toISOString().slice(0, 16),
    typeSoin: '',
    idActeCatalogue: null,
    description: '',
    observations: '',
    signatureInfirmier: false,
  });

  const [acteCatalogueLibelle, setActeCatalogueLibelle] = useState(initialData?.libelleActeCatalogue || '');

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
    <PageShell
      title={isEdit ? 'Modifier le soin' : 'Ajouter un soin'}
      maxWidth="max-w-6xl"
      onBack={() => router.push(LIST_ROUTE)}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection>
          <FormSelect
            label="Hospitalisation "
            value={form.idHospitalisation}
            onChange={(e) => setForm({ ...form, idHospitalisation: Number(e.target.value) })}
            options={hospitalisationOptions}
            required
          />

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Type de soin <span className="text-red-500">*</span>
            </label>
            <ActeAutocomplete
              categorie="Soin"
              value={acteCatalogueLibelle}
              onChange={(text) => {
                setActeCatalogueLibelle(text);
                setForm((prev) => ({ ...prev, typeSoin: text }));
                if (!text) setForm((prev) => ({ ...prev, idActeCatalogue: null }));
              }}
              onSelect={(acte) => {
                setActeCatalogueLibelle(acte.libelle);
                setForm((prev) => ({ ...prev, typeSoin: acte.libelle, idActeCatalogue: acte.idActeCatalogue }));
              }}
              onClear={() => setForm((prev) => ({ ...prev, idActeCatalogue: null }))}
              placeholder="Tapez pour rechercher (ex. : injection, pansement, perfusion...)"
            />
            {form.idActeCatalogue && <p className="mt-1.5 text-sm font-medium text-indigo-600">Soin du référentiel sélectionné</p>}
          </div>
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
            fonction="Infirmier"
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
        </FormSection>

        <FormActions
          onCancel={() => router.push(LIST_ROUTE)}
          submitLabel={isEdit ? 'Modifier' : 'Ajouter'}
          loading={loading}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
