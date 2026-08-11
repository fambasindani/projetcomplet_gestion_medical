// app/examens/modifier/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaFlask } from 'react-icons/fa';
import { examenService } from '@/app/services/examenService';
import { categorieExamenService } from '@/app/services/categorieExamenService';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { StatutExamen, ConfidentialiteExamen } from '@/app/types/examen';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const statutOptions = [
  { value: 'Prescrit', label: 'Prescrit' },
  { value: 'Planifié', label: 'Planifié' },
  { value: 'Réalisé', label: 'Réalisé' },
  { value: 'Validé', label: 'Validé' },
  { value: 'Annulé', label: 'Annulé' },
];

const confidentialiteOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Confidentiel', label: 'Confidentiel' },
  { value: 'Très confidentiel', label: 'Très confidentiel' },
];

export default function ModifierExamen() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<{ idCategorieExamen: number; libelle: string }[]>([]);
  const [formData, setFormData] = useState({
    idPatient: 0,
    idMedecinPrescripteur: 0,
    idPrescription: null as number | null,
    typeExamen: '',
    idCategorieExamen: 0,
    datePrescription: '',
    datePlanification: '',
    dateRealisation: '',
    laboratoire: '',
    technicien: '',
    resultat: '',
    interpretation: '',
    compteRendu: '',
    anomalies: '',
    conclusion: '',
    statut: 'Prescrit' as StatutExamen,
    confidentialite: 'Normal' as ConfidentialiteExamen,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [examen, categoriesList] = await Promise.all([
          examenService.getById(Number(id)),
          categorieExamenService.getAllList(),
        ]);
        setCategories(categoriesList);
        setFormData({
          idPatient: examen.idPatient,
          idMedecinPrescripteur: examen.idMedecinPrescripteur,
          idPrescription: examen.idPrescription ?? null,
          typeExamen: examen.typeExamen || '',
          idCategorieExamen: examen.idCategorieExamen,
          datePrescription: examen.datePrescription.slice(0, 16),
          datePlanification: examen.datePlanification ? examen.datePlanification.slice(0, 16) : '',
          dateRealisation: examen.dateRealisation ? examen.dateRealisation.slice(0, 16) : '',
          laboratoire: examen.laboratoire || '',
          technicien: examen.technicien || '',
          resultat: examen.resultat || '',
          interpretation: examen.interpretation || '',
          compteRendu: examen.compteRendu || '',
          anomalies: examen.anomalies || '',
          conclusion: examen.conclusion || '',
          statut: examen.statut,
          confidentialite: examen.confidentialite,
        });
      } catch (error) {
        console.error('Erreur de chargement :', error);
        toast.error('Impossible de charger les données');
        router.push('/examens/liste');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value ? Number(value) : 0) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idPatient || !formData.idMedecinPrescripteur || !formData.idCategorieExamen) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        idPatient: formData.idPatient,
        idMedecinPrescripteur: formData.idMedecinPrescripteur,
        idPrescription: formData.idPrescription ?? undefined,
        typeExamen: formData.typeExamen,
        idCategorieExamen: formData.idCategorieExamen,
        datePrescription: new Date(formData.datePrescription).toISOString(),
        datePlanification: formData.datePlanification ? new Date(formData.datePlanification).toISOString() : undefined,
        dateRealisation: formData.dateRealisation ? new Date(formData.dateRealisation).toISOString() : undefined,
        laboratoire: formData.laboratoire,
        technicien: formData.technicien,
        resultat: formData.resultat,
        interpretation: formData.interpretation,
        compteRendu: formData.compteRendu,
        anomalies: formData.anomalies,
        conclusion: formData.conclusion,
        statut: formData.statut,
        confidentialite: formData.confidentialite,
      };
      await examenService.update(Number(id), payload);
      toast.success('Examen modifié');
      router.push('/examens/liste');
    } catch (error) {
      console.error('Erreur :', error);
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <SkeletonDetails />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader
        title="Modifier l&apos;examen"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.back()}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
        {/* Ligne Patient / Médecin / Prescription */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <PatientSearchSelect
            value={formData.idPatient}
            onChange={(id) => setFormData(prev => ({ ...prev, idPatient: id || 0 }))}
            required
          />
          <MedecinSearchSelect
            value={formData.idMedecinPrescripteur}
            onChange={(id) => setFormData(prev => ({ ...prev, idMedecinPrescripteur: id || 0 }))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700">ID Prescription (facultatif)</label>
            <input
              type="number"
              name="idPrescription"
              value={formData.idPrescription ?? ''}
              onChange={(e) =>
                setFormData(prev => ({
                  ...prev,
                  idPrescription: e.target.value ? parseInt(e.target.value) : null,
                }))
              }
              className="w-full border rounded p-2"
              placeholder="Si lié à une prescription"
            />
          </div>
        </div>

        {/* Type et Catégorie */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Type d'examen"
            name="typeExamen"
            value={formData.typeExamen}
            onChange={handleChange}
            required
          />
          <FormSelect
            label="Catégorie"
            name="idCategorieExamen"
            value={formData.idCategorieExamen}
            onChange={(e) =>
              setFormData(prev => ({
                ...prev,
                idCategorieExamen: parseInt(e.target.value),
              }))
            }
            options={categories.map((c) => ({ value: c.idCategorieExamen, label: c.libelle }))}
            required
          />
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormInput
            label="Date prescription"
            name="datePrescription"
            type="datetime-local"
            value={formData.datePrescription}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Date planification"
            name="datePlanification"
            type="datetime-local"
            value={formData.datePlanification}
            onChange={handleChange}
          />
          <FormInput
            label="Date réalisation"
            name="dateRealisation"
            type="datetime-local"
            value={formData.dateRealisation}
            onChange={handleChange}
          />
        </div>

        {/* Laboratoire et Technicien */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Laboratoire"
            name="laboratoire"
            value={formData.laboratoire}
            onChange={handleChange}
          />
          <FormInput
            label="Technicien"
            name="technicien"
            value={formData.technicien}
            onChange={handleChange}
          />
        </div>

        {/* ===== Section Résultats et interprétation ===== */}
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-indigo-600">
            <FaFlask /> Résultats et interprétation
          </h3>
          <div className="space-y-4 mt-3">
            <FormTextarea
              label="Résultat"
              name="resultat"
              value={formData.resultat}
              onChange={handleChange}
              rows={3}
              placeholder="Saisir le résultat de l'examen"
            />
            <FormTextarea
              label="Interprétation"
              name="interpretation"
              value={formData.interpretation}
              onChange={handleChange}
              rows={3}
              placeholder="Interprétation médicale des résultats"
            />
            <FormTextarea
              label="Compte rendu"
              name="compteRendu"
              value={formData.compteRendu}
              onChange={handleChange}
              rows={3}
              placeholder="Compte rendu complet de l'examen"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormTextarea
                label="Anomalies"
                name="anomalies"
                value={formData.anomalies}
                onChange={handleChange}
                rows={2}
                placeholder="Anomalies constatées"
              />
              <FormTextarea
                label="Conclusion"
                name="conclusion"
                value={formData.conclusion}
                onChange={handleChange}
                rows={2}
                placeholder="Conclusion médicale"
              />
            </div>
          </div>
        </div>

        {/* Statut et confidentialité */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect
            label="Statut"
            name="statut"
            value={formData.statut}
            onChange={handleChange}
            options={statutOptions}
          />
          <FormSelect
            label="Confidentialité"
            name="confidentialite"
            value={formData.confidentialite}
            onChange={handleChange}
            options={confidentialiteOptions}
          />
        </div>

        {/* Boutons */}
        <div className="flex justify-end gap-4 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          <Button type="submit" disabled={saving} icon={<FaSave />}>
            {saving ? 'Modification...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
