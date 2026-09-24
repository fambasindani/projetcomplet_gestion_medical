// app/examens/resultat/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaCheckCircle, FaFlask } from 'react-icons/fa';
import { examenService } from '@/app/services/examenService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { FormInput } from '../common/FormInput';
import { FormTextarea } from '../common/FormTextarea';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import Button from '@/app/ui/Button';
import type { Examen } from '@/app/types/examen';

export default function SaisirResultatExamen() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<'save' | 'valider' | null>(null);
  const [examen, setExamen] = useState<Examen | null>(null);
  const [formData, setFormData] = useState({
    laboratoire: '',
    technicien: '',
    dateRealisation: '',
    resultat: '',
    interpretation: '',
    compteRendu: '',
    anomalies: '',
    conclusion: '',
    fichierJoint: '',
  });

  useEffect(() => {
    examenService.getById(Number(id))
      .then((ex) => {
        setExamen(ex);
        setFormData({
          laboratoire: ex.laboratoire || '',
          technicien: ex.technicien || '',
          dateRealisation: ex.dateRealisation ? ex.dateRealisation.slice(0, 16) : '',
          resultat: ex.resultat || '',
          interpretation: ex.interpretation || '',
          compteRendu: ex.compteRendu || '',
          anomalies: ex.anomalies || '',
          conclusion: ex.conclusion || '',
          fichierJoint: ex.fichierJoint || '',
        });
      })
      .catch(() => {
        toast.error('Impossible de charger l\'examen');
        router.push('/examens/liste');
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const submit = async (valider: boolean) => {
    if (!formData.resultat.trim() && !formData.compteRendu.trim() && !formData.conclusion.trim()) {
      toast.error('Saisissez au moins un résultat, un compte rendu ou une conclusion');
      return;
    }
    setSaving(valider ? 'valider' : 'save');
    try {
      await examenService.update(Number(id), {
        laboratoire: formData.laboratoire,
        technicien: formData.technicien,
        dateRealisation: formData.dateRealisation ? new Date(formData.dateRealisation).toISOString() : undefined,
        resultat: formData.resultat,
        interpretation: formData.interpretation,
        compteRendu: formData.compteRendu,
        anomalies: formData.anomalies,
        conclusion: formData.conclusion,
        fichierJoint: formData.fichierJoint,
        statut: valider ? 'Validé' : 'Réalisé',
      });
      toast.success(valider ? 'Résultat validé' : 'Résultat enregistré');
      router.push(`/examens/details/${id}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!examen) return <div className="p-6 text-center">Examen non trouvé</div>;

  const readonly = examen.statut === 'Validé';

  return (
    <PageShell
      title={`Résultat de l'examen ${examen.numeroExamen}`}
      subtitle={`${examen.typeExamen} — ${examen.patientNom}`}
      maxWidth="max-w-6xl"
      onBack={() => router.push(`/examens/details/${id}`)}
    >
      {readonly && (
        <div className="rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          Cet examen est <strong>validé</strong> : le résultat n&apos;est plus modifiable.
        </div>
      )}

      <FormSection>
        <h3 className="flex items-center gap-2 text-lg font-semibold text-indigo-600">
          <FaFlask /> Réalisation
        </h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FormInput label="Laboratoire" name="laboratoire" value={formData.laboratoire} onChange={handleChange} disabled={readonly} />
          <FormInput label="Technicien" name="technicien" value={formData.technicien} onChange={handleChange} disabled={readonly} />
          <FormInput
            label="Date de réalisation"
            name="dateRealisation"
            type="datetime-local"
            value={formData.dateRealisation}
            onChange={handleChange}
            disabled={readonly}
          />
        </div>

        <h3 className="border-t pt-4 text-lg font-semibold text-indigo-600">Résultat et interprétation</h3>
        <FormTextarea label="Résultat" name="resultat" value={formData.resultat} onChange={handleChange} rows={3} disabled={readonly} placeholder="Saisir le résultat de l'examen" />
        <FormTextarea label="Interprétation" name="interpretation" value={formData.interpretation} onChange={handleChange} rows={3} disabled={readonly} placeholder="Interprétation médicale" />
        <FormTextarea label="Compte rendu" name="compteRendu" value={formData.compteRendu} onChange={handleChange} rows={3} disabled={readonly} placeholder="Compte rendu complet" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormTextarea label="Anomalies" name="anomalies" value={formData.anomalies} onChange={handleChange} rows={2} disabled={readonly} placeholder="Anomalies constatées" />
          <FormTextarea label="Conclusion" name="conclusion" value={formData.conclusion} onChange={handleChange} rows={2} disabled={readonly} placeholder="Conclusion" />
        </div>
        <FormInput label="Fichier joint (URL)" name="fichierJoint" value={formData.fichierJoint} onChange={handleChange} disabled={readonly} placeholder="https://..." />

        {!readonly && (
          <div className="flex flex-wrap justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => router.push(`/examens/details/${id}`)}>
              Annuler
            </Button>
            <Button
              variant="secondary"
              icon={saving === 'save' ? undefined : <FaSave />}
              onClick={() => submit(false)}
              disabled={saving !== null}
            >
              {saving === 'save' ? 'Enregistrement...' : 'Enregistrer le résultat'}
            </Button>
            <Button
              icon={<FaCheckCircle />}
              onClick={() => submit(true)}
              disabled={saving !== null}
            >
              {saving === 'valider' ? 'Validation...' : 'Enregistrer et valider'}
            </Button>
          </div>
        )}
      </FormSection>
    </PageShell>
  );
}
