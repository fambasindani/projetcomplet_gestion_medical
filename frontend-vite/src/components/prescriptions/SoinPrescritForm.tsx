import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { FaSave } from 'react-icons/fa';
import { soinPrescritService } from '@/services/soinPrescritService';
import { personnelService } from '@/services/personnelService';
import { FormSelect } from '../common/FormSelect';
import { FormInput } from '../common/FormInput';
import { toast } from '@/utils/toast';
import { extractErrorMessage } from '@/utils/extractErrorMessage';
import { StatutSoin, SoinPrescrit } from '@/types/soin';
import SkeletonDetails from '@/ui/SkeletonDetails';
import PageShell from '@/ui/PageShell';
import FormSection from '@/ui/FormSection';
import FormActions from '@/ui/FormActions';

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
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();

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
      navigate(returnRoute);
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
      onBack={() => navigate(returnRoute)}
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
          onCancel={() => navigate(returnRoute)}
          submitLabel={isEdit ? 'Modifier' : 'Ajouter'}
          loading={loading}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
