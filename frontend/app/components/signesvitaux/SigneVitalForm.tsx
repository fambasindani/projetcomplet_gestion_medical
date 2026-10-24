'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/app/utils/toast';
import { FaSave, FaHeartbeat, FaWeight, FaRulerVertical, FaThermometerHalf } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import { signeVitalService } from '@/app/services/signeVitalService';
import { SigneVitalCreate } from '@/app/types/signeVital';
import { useAuth } from '@/app/contexts/AuthContext';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

interface Props {
  initialData?: SigneVitalCreate & { idSigneVital?: number };
  isEditing?: boolean;
}

export default function SigneVitalForm({ initialData, isEditing = false }: Props) {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditing);
  const [formData, setFormData] = useState<SigneVitalCreate>(() => initialData
    ? { ...initialData, dateMesure: initialData.dateMesure?.slice(0, 16) || '' }
    : {
        idPatient: searchParams.get('idPatient') ? Number(searchParams.get('idPatient')) : 0,
        idPersonnel: user?.personnelId ?? null,
        dateMesure: new Date().toISOString().slice(0, 16),
        poids: null,
        taille: null,
        temperature: null,
        pouls: null,
        pressionSystolique: null,
        pressionDiastolique: null,
        saturation: null,
        frequenceRespiratoire: null,
        glycemie: null,
        douleurEchelle: null,
        prisePar: user ? `${user.prenom} ${user.nom}` : '',
        observations: '',
      });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isEditing && params.id) {
      signeVitalService.getById(Number(params.id))
        .then((sv) => {
          setFormData({
            idPatient: sv.idPatient,
            idPersonnel: sv.idPersonnel,
            dateMesure: sv.dateMesure?.slice(0, 16) || '',
            poids: sv.poids,
            taille: sv.taille,
            temperature: sv.temperature,
            pouls: sv.pouls,
            pressionSystolique: sv.pressionSystolique,
            pressionDiastolique: sv.pressionDiastolique,
            saturation: sv.saturation,
            frequenceRespiratoire: sv.frequenceRespiratoire,
            glycemie: sv.glycemie,
            douleurEchelle: sv.douleurEchelle,
            prisePar: sv.prisePar ?? '',
            observations: sv.observations ?? '',
          });
        })
        .catch((e) => toast.error(extractErrorMessage(e)))
        .finally(() => setInitialLoading(false));
    }
  }, [isEditing, params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | null = value;
    if (type === 'number') newValue = value === '' ? null : Number(value);
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!formData.idPatient) err.idPatient = 'Patient requis';
    if (!formData.dateMesure) err.dateMesure = 'Date requise';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) { toast.error('Veuillez corriger les erreurs'); return; }
    setLoading(true);
    try {
      const payload = { ...formData, dateMesure: new Date(formData.dateMesure).toISOString() };
      if (isEditing && initialData?.idSigneVital) {
        await signeVitalService.update(initialData.idSigneVital, payload);
        toast.success('Mesure mise à jour');
      } else {
        await signeVitalService.create(payload);
        toast.success('Signes vitaux enregistrés');
      }
      router.push(`/signes-vitaux?idPatient=${formData.idPatient}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <SkeletonDetails />;

  return (
    <PageShell
      title={isEditing ? 'Modifier la mesure' : 'Nouveau relevé de signes vitaux'}
      onBack={() => router.back()}
      maxWidth="max-w-5xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection title="Patient et contexte" icon={<FaHeartbeat />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatientSearchSelect
              label="Patient"
              value={formData.idPatient}
              onChange={(id) => setFormData(prev => ({ ...prev, idPatient: id || 0 }))}
              required
              error={errors.idPatient}
            />
            <FormInput
              label="Date et heure de mesure"
              name="dateMesure"
              type="datetime-local"
              value={formData.dateMesure}
              onChange={handleChange}
              required
              error={errors.dateMesure}
              icon={<FaHeartbeat />}
            />
            <FormInput
              label="Prise par"
              name="prisePar"
              value={formData.prisePar ?? ''}
              onChange={handleChange}
              placeholder="Infirmier(ère)"
            />
          </div>
        </FormSection>

        <FormSection title="Mesures anthropométriques" icon={<FaWeight />}>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <FormInput label="Poids (kg)" name="poids" type="number" step="0.1" value={formData.poids ?? ''} onChange={handleChange} icon={<FaWeight />} />
            <FormInput label="Taille (cm)" name="taille" type="number" step="0.1" value={formData.taille ?? ''} onChange={handleChange} icon={<FaRulerVertical />} />
            <div className="flex items-center">
              <p className="text-xs text-slate-400">L&apos;IMC est calculé automatiquement à partir du poids et de la taille.</p>
            </div>
          </div>
        </FormSection>

        <FormSection title="Constantes vitales" icon={<FaThermometerHalf />}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FormInput label="Température (°C)" name="temperature" type="number" step="0.1" value={formData.temperature ?? ''} onChange={handleChange} icon={<FaThermometerHalf />} />
            <FormInput label="Pouls (bpm)" name="pouls" type="number" value={formData.pouls ?? ''} onChange={handleChange} />
            <FormInput label="Pression systolique" name="pressionSystolique" type="number" value={formData.pressionSystolique ?? ''} onChange={handleChange} />
            <FormInput label="Pression diastolique" name="pressionDiastolique" type="number" value={formData.pressionDiastolique ?? ''} onChange={handleChange} />
            <FormInput label="Saturation O₂ (%)" name="saturation" type="number" value={formData.saturation ?? ''} onChange={handleChange} />
            <FormInput label="Fréq. respiratoire" name="frequenceRespiratoire" type="number" value={formData.frequenceRespiratoire ?? ''} onChange={handleChange} />
            <FormInput label="Glycémie (g/L)" name="glycemie" type="number" step="0.1" value={formData.glycemie ?? ''} onChange={handleChange} />
            <FormInput label="Douleur (0-10)" name="douleurEchelle" type="number" min="0" max="10" value={formData.douleurEchelle ?? ''} onChange={handleChange} />
          </div>
        </FormSection>

        <FormSection>
          <FormTextarea label="Observations" name="observations" value={formData.observations ?? ''} onChange={handleChange} rows={3} />
        </FormSection>

        <FormActions
          onCancel={() => router.back()}
          loading={loading}
          submitLabel={isEditing ? 'Mettre à jour' : 'Enregistrer'}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
