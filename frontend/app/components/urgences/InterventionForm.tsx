'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { urgenceService } from '@/app/services/urgenceService';
import type { InterventionUrgence, InterventionUrgenceCreate } from '@/app/types/urgence';
import { StatutInterventionUrgence, StatutInterventionUrgenceLabels, StatutInterventionUrgenceValues } from '@/app/types/urgence';
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

interface InterventionFormProps {
  initialData?: InterventionUrgence | null;
  isEdit?: boolean;
}

export default function InterventionForm({ initialData, isEdit = false }: InterventionFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const admissionParam = searchParams.get('admission');
  const [idPatient, setIdPatient] = useState<number | null>(initialData?.idPatient ?? null);
  const [idMedecin, setIdMedecin] = useState<number | null>(initialData?.idMedecinPrincipal ?? null);
  const [idAdmissionUrgence, setIdAdmissionUrgence] = useState<number | null>(
    initialData?.idAdmissionUrgence ?? (admissionParam ? Number(admissionParam) : null),
  );
  const [typeIntervention, setTypeIntervention] = useState(initialData?.typeIntervention ?? '');
  const [dateIntervention, setDateIntervention] = useState(
    initialData?.dateIntervention ? initialData.dateIntervention.slice(0, 16) : new Date().toISOString().slice(0, 16),
  );
  const [lieu, setLieu] = useState(initialData?.lieu ?? '');
  const [dureePrevue, setDureePrevue] = useState(initialData?.dureePrevue?.toString() ?? '');
  const [actesRealises, setActesRealises] = useState(initialData?.actesRealises ?? '');
  const [materielUtilise, setMaterielUtilise] = useState(initialData?.materielUtilise ?? '');
  const [complications, setComplications] = useState(initialData?.complications ?? '');
  const [resultat, setResultat] = useState(initialData?.resultat ?? '');
  const [statut, setStatut] = useState<StatutInterventionUrgence>(initialData?.statut ?? StatutInterventionUrgence.Planifiee);
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!idPatient) err.idPatient = 'Le patient est requis';
    if (!idMedecin) err.idMedecin = 'Le médecin est requis';
    if (!typeIntervention.trim()) err.typeIntervention = 'Le type d\'intervention est requis';
    if (!dateIntervention) err.dateIntervention = 'La date est requise';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload: InterventionUrgenceCreate = {
        idPatient,
        idAdmissionUrgence,
        idMedecinPrincipal: idMedecin,
        typeIntervention: typeIntervention.trim(),
        dateIntervention: formatDateForBackend(dateIntervention),
        lieu: lieu || null,
        dureePrevue: dureePrevue ? Number(dureePrevue) : null,
        actesRealises: actesRealises || null,
        materielUtilise: materielUtilise || null,
        complications: complications || null,
        resultat: resultat || null,
        statut,
        notes: notes || null,
      };
      if (isEdit && initialData) {
        await urgenceService.updateIntervention(initialData.idInterventionUrgence, payload);
        toast.success('Intervention mise à jour');
      } else {
        await urgenceService.createIntervention(payload);
        toast.success('Intervention créée');
      }
      router.push('/urgences/interventions');
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
        title={isEdit ? 'Modifier l\'intervention' : 'Nouvelle intervention d\'urgence'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/urgences/interventions')}>
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
            <MedecinSearchSelect value={idMedecin} onChange={setIdMedecin} error={errors.idMedecin} required label="Médecin principal" />
            <FormInput label="Admission urgences (ID)" name="idAdmissionUrgence" type="number"
              value={idAdmissionUrgence ?? ''} onChange={(e) => setIdAdmissionUrgence(e.target.value ? Number(e.target.value) : null)}
              placeholder="Optionnel" />
            <div className="md:col-span-2">
              <FormInput label="Type d'intervention" name="typeIntervention" value={typeIntervention}
                onChange={(e) => setTypeIntervention(e.target.value)} error={errors.typeIntervention} required
                placeholder="Ex : pose de voie veineuse, suture, débridement..." />
            </div>
            <FormInput label="Date et heure" name="dateIntervention" type="datetime-local" value={dateIntervention}
              onChange={(e) => setDateIntervention(e.target.value)} error={errors.dateIntervention} required />
            <FormInput label="Lieu" name="lieu" value={lieu} onChange={(e) => setLieu(e.target.value)} placeholder="Ex : box de soins, bloc..." />
            <FormInput label="Durée prévue (min)" name="dureePrevue" type="number" value={dureePrevue} onChange={(e) => setDureePrevue(e.target.value)} />
            <FormSelect label="Statut" name="statut" value={statut}
              onChange={(e) => setStatut(e.target.value as StatutInterventionUrgence)}
              options={StatutInterventionUrgenceValues.map((s) => ({ value: s, label: StatutInterventionUrgenceLabels[s] }))} />
            <div className="md:col-span-2">
              <FormTextarea label="Actes réalisés" name="actesRealises" value={actesRealises} onChange={(e) => setActesRealises(e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <FormTextarea label="Matériel utilisé" name="materielUtilise" value={materielUtilise} onChange={(e) => setMaterielUtilise(e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <FormTextarea label="Complications" name="complications" value={complications} onChange={(e) => setComplications(e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <FormTextarea label="Résultat" name="resultat" value={resultat} onChange={(e) => setResultat(e.target.value)} rows={2} />
            </div>
            <div className="md:col-span-2">
              <FormTextarea label="Notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button type="button" variant="secondary" onClick={() => router.push('/urgences/interventions')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : isEdit ? 'Enregistrer' : 'Créer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
