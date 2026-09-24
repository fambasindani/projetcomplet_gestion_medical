'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave } from 'react-icons/fa';
import { FormInput } from '../../common/FormInput';
import { FormTextarea } from '../../common/FormTextarea';
import { constanteService } from '@/app/services/constanteService';
import { ConstanteCreate, Constante } from '@/app/types/constante';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

interface ConstanteFormProps {
  initialData?: Constante | null;
  isEdit?: boolean;
}

export default function ConstanteForm({ initialData, isEdit = false }: ConstanteFormProps) {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const hospId = isEdit && initialData
    ? initialData.idHospitalisation
    : (Number(params.id) || Number(searchParams.get('hospitalisation')) || 0);
  const returnRoute = `/patients/hospitalisations/${hospId}/constantes`;

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ConstanteCreate>>(() => initialData ? {
    idHospitalisation: initialData.idHospitalisation,
    dateMesure: initialData.dateMesure.slice(0, 16),
    temperature: initialData.temperature,
    pouls: initialData.pouls,
    pressionSystolique: initialData.pressionSystolique,
    pressionDiastolique: initialData.pressionDiastolique,
    saturation: initialData.saturation,
    frequenceRespiratoire: initialData.frequenceRespiratoire,
    glycemie: initialData.glycemie,
    douleurEchelle: initialData.douleurEchelle,
    prisePar: initialData.prisePar || '',
    observations: initialData.observations || '',
  } : {
    idHospitalisation: hospId,
    dateMesure: new Date().toISOString().slice(0, 16),
    temperature: null,
    pouls: null,
    pressionSystolique: null,
    pressionDiastolique: null,
    saturation: null,
    frequenceRespiratoire: null,
    glycemie: null,
    douleurEchelle: null,
    prisePar: '',
    observations: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | null = value;
    if (type === 'number') newValue = value === '' ? null : Number(value);
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.dateMesure) newErrors.dateMesure = 'Date et heure requises';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        dateMesure: new Date(formData.dateMesure!).toISOString(),
        idHospitalisation: Number(hospId),
      };
      if (isEdit && initialData?.idConstante) {
        await constanteService.update(initialData.idConstante, payload);
        toast.success('Constante mise à jour');
      } else {
        await constanteService.create(payload as ConstanteCreate);
        toast.success('Constante ajoutée');
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
      title={isEdit ? 'Modifier constante' : 'Nouvelle constante'}
      onBack={() => router.push(returnRoute)}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Date et heure"
              name="dateMesure"
              type="datetime-local"
              value={formData.dateMesure || ''}
              onChange={handleChange}
              required
              error={errors.dateMesure}
            />
            <FormInput label="Température (°C)" name="temperature" type="number" step="0.1" value={formData.temperature ?? ''} onChange={handleChange} />
            <FormInput label="Pouls (bpm)" name="pouls" type="number" value={formData.pouls ?? ''} onChange={handleChange} />
            <FormInput label="Pression systolique" name="pressionSystolique" type="number" value={formData.pressionSystolique ?? ''} onChange={handleChange} />
            <FormInput label="Pression diastolique" name="pressionDiastolique" type="number" value={formData.pressionDiastolique ?? ''} onChange={handleChange} />
            <FormInput label="Saturation O2 (%)" name="saturation" type="number" value={formData.saturation ?? ''} onChange={handleChange} />
            <FormInput label="Fréquence respiratoire" name="frequenceRespiratoire" type="number" value={formData.frequenceRespiratoire ?? ''} onChange={handleChange} />
            <FormInput label="Glycémie (g/L)" name="glycemie" type="number" step="0.1" value={formData.glycemie ?? ''} onChange={handleChange} />
            <FormInput label="Douleur (0-10)" name="douleurEchelle" type="number" min="0" max="10" value={formData.douleurEchelle ?? ''} onChange={handleChange} />
          </div>
          <FormInput label="Prise par" name="prisePar" value={formData.prisePar || ''} onChange={handleChange} placeholder="Infirmier(ère)" />
          <FormTextarea label="Observations" name="observations" value={formData.observations || ''} onChange={handleChange} rows={2} />
        </FormSection>

        <FormActions
          onCancel={() => router.push(returnRoute)}
          loading={loading}
          submitLabel={isEdit ? 'Modifier' : 'Ajouter'}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
