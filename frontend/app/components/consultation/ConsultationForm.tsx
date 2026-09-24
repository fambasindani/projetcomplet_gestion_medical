// app/components/consultation/ConsultationForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaUser, FaCalendarAlt, FaHeartbeat, FaPills, FaCalendarCheck } from 'react-icons/fa';
import { ConsultationCreate, Consultation } from '@/app/types/consultation';
import { consultationService } from '@/app/services/consultationService';
import { patientService } from '@/app/services/patientService';
import { medecinService } from '@/app/services/medecinService';
import { FormInput } from '../common/FormInput';
import { FormTextarea } from '../common/FormTextarea';
import { FormSelect } from '../common/FormSelect';
import ActeAutocomplete from '../facturation/ActeAutocomplete';
import SelectionModal from '@/app/ui/SelectionModal';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import Button from '@/app/ui/Button';

interface SelectableItem {
  id: number;
  nom: string;
  prenom: string;
}

interface Props {
  initialData?: ConsultationCreate | Consultation;
  isEdit?: boolean;
  id?: number;
}

const formatDateTimeLocal = (date?: string | null): string => {
  if (!date) return '';
  if (date.includes('T')) return date.slice(0, 16);
  return `${date}T00:00`;
};

const ConsultationForm: React.FC<Props> = ({ initialData, isEdit, id }) => {
  const router = useRouter();

  const [formData, setFormData] = useState<ConsultationCreate>({
    idRdv: null,
    idPatient: 0,
    idMedecin: 0,
    dateConsultation: new Date().toISOString().slice(0, 16),
    motifConsultation: '',
    histoireMaladie: '',
    diagnostic: '',
    traitementPrescris: '',
    observations: '',
    temperature: null,
    pouls: null,
    pressionSystolique: null,
    pressionDiastolique: null,
    saturation: null,
    glycemie: null,
    poids: null,
    taille: null,
    certificatMedical: '',
    arretTravailDebut: '',
    arretTravailFin: '',
    evolution: '',
    prochainRdv: '',
    notesConfidentielles: '',
    idActeCatalogue: null,
    ...(initialData ? {
      idRdv: initialData.idRdv,
      idPatient: initialData.idPatient,
      idMedecin: initialData.idMedecin,
      dateConsultation: initialData.dateConsultation,
      motifConsultation: initialData.motifConsultation,
      histoireMaladie: initialData.histoireMaladie,
      diagnostic: initialData.diagnostic,
      traitementPrescris: initialData.traitementPrescris,
      observations: initialData.observations,
      temperature: initialData.temperature,
      pouls: initialData.pouls,
      pressionSystolique: initialData.pressionSystolique,
      pressionDiastolique: initialData.pressionDiastolique,
      saturation: initialData.saturation,
      glycemie: initialData.glycemie,
      poids: initialData.poids,
      taille: initialData.taille,
      certificatMedical: initialData.certificatMedical,
      arretTravailDebut: initialData.arretTravailDebut,
      arretTravailFin: initialData.arretTravailFin,
      evolution: initialData.evolution,
      prochainRdv: initialData.prochainRdv,
      notesConfidentielles: initialData.notesConfidentielles,
      idActeCatalogue: initialData.idActeCatalogue,
    } : {})
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [patientModalOpen, setPatientModalOpen] = useState(false);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [selectedPatientName, setSelectedPatientName] = useState('');
  const [selectedDoctorName, setSelectedDoctorName] = useState('');
  const [acteCatalogueLibelle, setActeCatalogueLibelle] = useState(
    (initialData as Consultation | undefined)?.libelleActeCatalogue || ''
  );

  useEffect(() => {
    if (formData.idPatient && formData.idPatient !== 0 && !selectedPatientName) {
      patientService.getById(formData.idPatient)
        .then(p => setSelectedPatientName(`${p.nom} ${p.prenom}`))
        .catch(() => {});
    }
    if (formData.idMedecin && formData.idMedecin !== 0 && !selectedDoctorName) {
      medecinService.getById(formData.idMedecin)
        .then(m => setSelectedDoctorName(`${m.nom} ${m.prenom}`))
        .catch(() => {});
    }
  }, [formData.idPatient, formData.idMedecin, selectedPatientName, selectedDoctorName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | null = value;

    if (type === 'number') {
      newValue = value === '' ? null : Number(value);
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.idPatient || formData.idPatient === 0) newErrors.idPatient = 'Patient requis';
    if (!formData.idMedecin || formData.idMedecin === 0) newErrors.idMedecin = 'Médecin requis';
    if (!formData.dateConsultation) newErrors.dateConsultation = 'Date de consultation requise';
    if (!formData.motifConsultation?.trim()) newErrors.motifConsultation = 'Motif requis';
    if (!formData.evolution?.trim()) newErrors.evolution = 'Évolution requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }
    setLoading(true);
    try {
      const payload: ConsultationCreate = {
        ...formData,
        dateConsultation: new Date(formData.dateConsultation).toISOString(),
        arretTravailDebut: formData.arretTravailDebut ? new Date(formData.arretTravailDebut).toISOString() : null,
        arretTravailFin: formData.arretTravailFin ? new Date(formData.arretTravailFin).toISOString() : null,
        prochainRdv: formData.prochainRdv ? new Date(formData.prochainRdv).toISOString() : null,
      };

      if (isEdit && id) {
        await consultationService.update(id, payload);
        toast.success('Consultation modifiée');
      } else {
        await consultationService.create(payload);
        toast.success('Consultation créée');
      }
      router.push('/consultations');
    } catch (error: unknown) {
      console.error(error);
      let message = 'Erreur lors de l\'enregistrement';
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        message = axiosError.response?.data?.message || message;
      }
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title={isEdit ? 'Modifier consultation' : 'Nouvelle consultation'}
      maxWidth="max-w-6xl"
      onBack={() => router.back()}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section 1 : Patient & Médecin */}
      <FormSection title="Patient & Médecin" icon={<FaUser />}>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Patient <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedPatientName}
                readOnly
                placeholder="Sélectionner un patient"
                className={`flex-1 rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 ${errors.idPatient ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-slate-50'}`}
              />
              <Button type="button" onClick={() => setPatientModalOpen(true)}>
                Choisir
              </Button>
            </div>
            {errors.idPatient && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.idPatient}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Médecin <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={selectedDoctorName}
                readOnly
                placeholder="Sélectionner un médecin"
                className={`flex-1 rounded-xl border px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 ${errors.idMedecin ? 'border-red-300 bg-red-50/30' : 'border-slate-200 bg-slate-50'}`}
              />
              <Button type="button" onClick={() => setDoctorModalOpen(true)}>
                Choisir
              </Button>
            </div>
            {errors.idMedecin && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.idMedecin}</p>}
          </div>
        </div>
      </FormSection>

      {/* Section 2 : Consultation */}
      <FormSection title="Consultation" icon={<FaCalendarAlt />}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            label="Date consultation"
            name="dateConsultation"
            type="datetime-local"
            value={formData.dateConsultation}
            onChange={handleChange}
            required
            error={errors.dateConsultation}
          />
          <FormInput
            label="Motif"
            name="motifConsultation"
            value={formData.motifConsultation}
            onChange={handleChange}
            required
            error={errors.motifConsultation}
          />
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-gray-800">
              Type de consultation
            </label>
            <ActeAutocomplete
              categorie="Consultation"
              value={acteCatalogueLibelle}
              onChange={(text) => {
                setActeCatalogueLibelle(text);
                if (!text) setFormData((prev) => ({ ...prev, idActeCatalogue: null }));
              }}
              onSelect={(acte) => {
                setActeCatalogueLibelle(acte.libelle);
                setFormData((prev) => ({ ...prev, idActeCatalogue: acte.idActeCatalogue }));
              }}
              onClear={() => setFormData((prev) => ({ ...prev, idActeCatalogue: null }))}
              placeholder="Tapez pour rechercher (ex. : consultation générale, spécialisée...)"
            />
            {formData.idActeCatalogue && acteCatalogueLibelle && (
              <p className="mt-1.5 text-xs font-medium text-indigo-600">
                {acteCatalogueLibelle}
              </p>
            )}
          </div>
          <FormTextarea label="Histoire de la maladie" name="histoireMaladie" value={formData.histoireMaladie || ''} onChange={handleChange} rows={3} />
          <FormTextarea label="Diagnostic" name="diagnostic" value={formData.diagnostic || ''} onChange={handleChange} rows={3} />
          <FormTextarea label="Traitement prescrit" name="traitementPrescris" value={formData.traitementPrescris || ''} onChange={handleChange} rows={3} />
          <FormTextarea label="Observations" name="observations" value={formData.observations || ''} onChange={handleChange} rows={3} />
        </div>
      </FormSection>

      {/* Section 3 : Constantes */}
      <FormSection title="Constantes" icon={<FaHeartbeat />}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          <FormInput label="Température (°C)" name="temperature" type="number" step="0.1" value={formData.temperature ?? ''} onChange={handleChange} />
          <FormInput label="Pouls (bpm)" name="pouls" type="number" value={formData.pouls ?? ''} onChange={handleChange} />
          <FormInput label="Pression systolique" name="pressionSystolique" type="number" value={formData.pressionSystolique ?? ''} onChange={handleChange} />
          <FormInput label="Pression diastolique" name="pressionDiastolique" type="number" value={formData.pressionDiastolique ?? ''} onChange={handleChange} />
          <FormInput label="Saturation O2 (%)" name="saturation" type="number" value={formData.saturation ?? ''} onChange={handleChange} />
          <FormInput label="Glycémie (g/L)" name="glycemie" type="number" step="0.1" value={formData.glycemie ?? ''} onChange={handleChange} />
          <FormInput label="Poids (kg)" name="poids" type="number" step="0.1" value={formData.poids ?? ''} onChange={handleChange} />
          <FormInput label="Taille (m)" name="taille" type="number" step="0.01" value={formData.taille ?? ''} onChange={handleChange} />
        </div>
      </FormSection>

      {/* Section 4 : Certificat & Arrêt */}
      <FormSection title="Certificat médical & Arrêt de travail" icon={<FaPills />}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput label="Certificat médical" name="certificatMedical" value={formData.certificatMedical || ''} onChange={handleChange} />
          <FormInput label="Arrêt début" name="arretTravailDebut" type="date" value={formData.arretTravailDebut || ''} onChange={handleChange} />
          <FormInput label="Arrêt fin" name="arretTravailFin" type="date" value={formData.arretTravailFin || ''} onChange={handleChange} />
          <FormSelect
            label="Évolution"
            name="evolution"
            value={formData.evolution || ''}
            onChange={handleChange}
            options={[
              { value: '', label: 'Veuillez Sélectionner' },
              { value: 'Favorable', label: 'Favorable' },
              { value: 'Stationnaire', label: 'Stationnaire' },
              { value: 'Defavorable', label: 'Défavorable' }
            ]}
            required
            error={errors.evolution}
          />
        </div>
      </FormSection>

      {/* Section 5 : Suivi */}
      <FormSection title="Suivi" icon={<FaCalendarCheck />}>
        <div className="grid grid-cols-1 gap-4">
          <FormInput label="Prochain rendez-vous" name="prochainRdv" type="datetime-local" value={formatDateTimeLocal(formData.prochainRdv)} onChange={handleChange} />
          <FormTextarea label="Notes confidentielles" name="notesConfidentielles" value={formData.notesConfidentielles || ''} onChange={handleChange} rows={3} />
        </div>
      </FormSection>

      {/* Actions */}
      <FormActions
        onCancel={() => router.back()}
        submitLabel="Enregistrer"
        loading={loading}
        submitIcon={<FaSave />}
      />

      {/* Modals de sélection */}
      <SelectionModal
        isOpen={patientModalOpen}
        onClose={() => setPatientModalOpen(false)}
        onSelect={(item: SelectableItem) => {
          setFormData(prev => ({ ...prev, idPatient: item.id }));
          setSelectedPatientName(`${item.nom} ${item.prenom}`);
        }}
        title="Sélectionner un patient"
        fetchItems={async (search) => {
          const res = await patientService.getSimpleList(search);
          return res;
        }}
      />
      <SelectionModal
        isOpen={doctorModalOpen}
        onClose={() => setDoctorModalOpen(false)}
        onSelect={(item: SelectableItem) => {
          setFormData(prev => ({ ...prev, idMedecin: item.id }));
          setSelectedDoctorName(`${item.nom} ${item.prenom}`);
        }}
        title="Sélectionner un médecin"
        fetchItems={async (search) => {
          const res = await medecinService.getSimpleList(search);
          return res;
        }}
      />
      </form>
    </PageShell>
  );
};

export default ConsultationForm;