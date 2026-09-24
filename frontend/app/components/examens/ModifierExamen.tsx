// app/examens/modifier/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { examenService } from '@/app/services/examenService';
import { categorieExamenService } from '@/app/services/categorieExamenService';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import { ConfidentialiteExamen } from '@/app/types/examen';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const confidentialiteOptions = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Confidentiel', label: 'Confidentiel' },
  { value: 'Très_confidentiel', label: 'Très confidentiel' },
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
    typeExamen: '',
    idCategorieExamen: 0,
    datePrescription: '',
    datePlanification: '',
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
          typeExamen: examen.typeExamen || '',
          idCategorieExamen: examen.idCategorieExamen,
          datePrescription: examen.datePrescription.slice(0, 16),
          datePlanification: examen.datePlanification ? examen.datePlanification.slice(0, 16) : '',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.idPatient || !formData.idMedecinPrescripteur || !formData.idCategorieExamen) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setSaving(true);
    try {
      // On n'envoie que les champs de la demande (mise à jour partielle côté backend).
      const payload = {
        idPatient: formData.idPatient,
        idMedecinPrescripteur: formData.idMedecinPrescripteur,
        typeExamen: formData.typeExamen,
        idCategorieExamen: formData.idCategorieExamen,
        datePrescription: new Date(formData.datePrescription).toISOString(),
        datePlanification: formData.datePlanification ? new Date(formData.datePlanification).toISOString() : undefined,
        confidentialite: formData.confidentialite,
      };
      await examenService.update(Number(id), payload);
      toast.success('Demande modifiée');
      router.push(`/examens/details/${id}`);
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
    <PageShell
      title="Modifier la demande d'examen"
      subtitle="Patient, médecin prescripteur, type et planification"
      maxWidth="max-w-6xl"
      onBack={() => router.back()}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
            onChange={(e) => setFormData(prev => ({ ...prev, idCategorieExamen: parseInt(e.target.value) }))}
            options={categories.map((c) => ({ value: c.idCategorieExamen, label: c.libelle }))}
            required
          />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          <FormSelect
            label="Confidentialité"
            name="confidentialite"
            value={formData.confidentialite}
            onChange={handleChange}
            options={confidentialiteOptions}
          />
        </div>
        </FormSection>

        <FormActions
          onCancel={() => router.back()}
          submitLabel="Enregistrer"
          loading={saving}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
