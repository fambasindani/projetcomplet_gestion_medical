'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { urgenceService } from '@/app/services/urgenceService';
import type { AdmissionUrgence, AdmissionUrgenceCreate } from '@/app/types/urgence';
import { GraviteUrgence, GraviteUrgenceLabels, GraviteUrgenceValues, StatutAdmissionUrgence, StatutAdmissionUrgenceLabels, StatutAdmissionUrgenceValues } from '@/app/types/urgence';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import SkeletonDetails from '@/app/ui/SkeletonDetails';

const formatDateForBackend = (dateStr: string): string => {
  if (!dateStr) return '';
  const localDate = new Date(dateStr);
  if (isNaN(localDate.getTime())) return '';
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  const seconds = String(localDate.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

interface AdmissionFormProps {
  initialData?: AdmissionUrgence | null;
  isEdit?: boolean;
}

export default function AdmissionForm({ initialData, isEdit = false }: AdmissionFormProps) {
  const router = useRouter();
  const [idPatient, setIdPatient] = useState<number | null>(initialData?.idPatient ?? null);
  const [idMedecin, setIdMedecin] = useState<number | null>(initialData?.idMedecin ?? null);
  const [dateArrivee, setDateArrivee] = useState(
    initialData?.dateArrivee ? initialData.dateArrivee.slice(0, 16) : new Date().toISOString().slice(0, 16),
  );
  const [motifUrgent, setMotifUrgent] = useState(initialData?.motifUrgent ?? '');
  const [gravite, setGravite] = useState<GraviteUrgence>(initialData?.gravite ?? GraviteUrgence.Non_urgente);
  const [symptomes, setSymptomes] = useState(initialData?.symptomes ?? '');
  const [tensionArterielle, setTensionArterielle] = useState(initialData?.tensionArterielle ?? '');
  const [pouls, setPouls] = useState(initialData?.pouls?.toString() ?? '');
  const [temperature, setTemperature] = useState(initialData?.temperature?.toString() ?? '');
  const [saturationOxygene, setSaturationOxygene] = useState(initialData?.saturationOxygene?.toString() ?? '');
  const [statut, setStatut] = useState<StatutAdmissionUrgence>(initialData?.statut ?? StatutAdmissionUrgence.En_attente);
  const [orientation, setOrientation] = useState(initialData?.orientation ?? '');
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!idPatient) err.idPatient = 'Le patient est requis';
    if (!motifUrgent.trim()) err.motifUrgent = 'Le motif est requis';
    if (!dateArrivee) err.dateArrivee = 'La date d\'arrivée est requise';
    if (pouls && (Number(pouls) <= 0 || Number(pouls) > 300)) err.pouls = 'Pouls invalide';
    if (saturationOxygene && (Number(saturationOxygene) < 0 || Number(saturationOxygene) > 100)) err.saturationOxygene = 'Saturation entre 0 et 100';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: AdmissionUrgenceCreate = {
        idPatient,
        idMedecin,
        dateArrivee: formatDateForBackend(dateArrivee),
        motifUrgent: motifUrgent.trim(),
        gravite,
        symptomes: symptomes || null,
        tensionArterielle: tensionArterielle || null,
        pouls: pouls ? Number(pouls) : null,
        temperature: temperature ? Number(temperature) : null,
        saturationOxygene: saturationOxygene ? Number(saturationOxygene) : null,
        statut,
        orientation: orientation || null,
        notes: notes || null,
      };
      if (isEdit && initialData) {
        await urgenceService.updateAdmission(initialData.idAdmissionUrgence, payload);
        toast.success('Admission mise à jour');
      } else {
        await urgenceService.createAdmission(payload);
        toast.success('Admission enregistrée');
      }
      router.push('/urgences/admissions');
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
        title={isEdit ? 'Modifier l\'admission' : 'Nouvelle admission aux urgences'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/urgences/admissions')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <PatientSearchSelect value={idPatient} onChange={setIdPatient} error={errors.idPatient} required label="Patient" />
            </div>
            <MedecinSearchSelect value={idMedecin} onChange={setIdMedecin} label="Médecin responsable" />
            <FormInput label="Date et heure d'arrivée" name="dateArrivee" type="datetime-local" value={dateArrivee} onChange={(e) => setDateArrivee(e.target.value)} error={errors.dateArrivee} required />
            <FormSelect
              label="Niveau de gravité"
              name="gravite"
              value={gravite}
              onChange={(e) => setGravite(e.target.value as GraviteUrgence)}
              options={GraviteUrgenceValues.map((g) => ({ value: g, label: GraviteUrgenceLabels[g] }))}
              required
            />
            <FormSelect
              label="Statut"
              name="statut"
              value={statut}
              onChange={(e) => setStatut(e.target.value as StatutAdmissionUrgence)}
              options={StatutAdmissionUrgenceValues.map((s) => ({ value: s, label: StatutAdmissionUrgenceLabels[s] }))}
            />
            <div className="md:col-span-2">
              <FormInput label="Motif urgent" name="motifUrgent" value={motifUrgent} onChange={(e) => setMotifUrgent(e.target.value)} error={errors.motifUrgent} required placeholder="Ex : douleur thoracique, accident..." />
            </div>
            <div className="md:col-span-2">
              <FormTextarea label="Symptômes" name="symptomes" value={symptomes} onChange={(e) => setSymptomes(e.target.value)} rows={2} placeholder="Symptômes observés..." />
            </div>
            <FormInput label="Tension artérielle" name="tensionArterielle" value={tensionArterielle} onChange={(e) => setTensionArterielle(e.target.value)} placeholder="Ex : 140/90" />
            <FormInput label="Pouls (bpm)" name="pouls" type="number" value={pouls} onChange={(e) => setPouls(e.target.value)} error={errors.pouls} />
            <FormInput label="Température (°C)" name="temperature" type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} />
            <FormInput label="Saturation O₂ (%)" name="saturationOxygene" type="number" value={saturationOxygene} onChange={(e) => setSaturationOxygene(e.target.value)} error={errors.saturationOxygene} />
            <div className="md:col-span-2">
              <FormInput label="Orientation" name="orientation" value={orientation} onChange={(e) => setOrientation(e.target.value)} placeholder="Ex : hospitalisation, domicile..." />
            </div>
            <div className="md:col-span-2">
              <FormTextarea label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="secondary" onClick={() => router.push('/urgences/admissions')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Admettre'}
          </Button>
        </div>
      </form>
    </div>
  );
}
