'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUser, FaIdCard, FaPhone, FaBriefcase, FaHeart, FaFileAlt, FaSave, FaUserMd, FaEnvelope, FaMapMarkerAlt, FaVenusMars, FaCalendarAlt } from 'react-icons/fa';
import axios from 'axios';
import { GroupeSanguinLabels, PatientCreate, SituationFamilialeLabels } from '@/app/types/patient';
import { patientService } from '@/app/services/patientService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';




const PatientFormPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isEditMode = !!params.id;

  const formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.split('T')[0];
    return dateString;
  };

  const [formData, setFormData] = useState<PatientCreate>({
    numeroSecuriteSociale: '',
    nom: '',
    prenom: '',
    dateNaissance: new Date().toISOString().split('T')[0],
    lieuNaissance: '',
    genre: 'M',
    telephone: '',
    telephoneUrgent: '',
    email: '',
    adresse: '',
    profession: '',
    situationFamiliale: undefined,
    groupeSanguin: undefined,
    allergies: '',
    antecedentsMedicaux: '',
    antecedentsChirurgicaux: '',
    traitementHabituel: '',
    mutuelle: '',
    numeroMutuelle: '',
    personneContactNom: '',
    personneContactLien: '',
    personneContactTelephone: '',
    consentement: true,
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [, setValidated] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      const fetchPatient = async () => {
        setInitialLoading(true);
        try {
          const patient = await patientService.getById(Number(params.id));
          setFormData({
            numeroSecuriteSociale: patient.numeroSecuriteSociale,
            nom: patient.nom,
            prenom: patient.prenom,
            dateNaissance: formatDateForInput(patient.dateNaissance) || new Date().toISOString().split('T')[0],
            lieuNaissance: patient.lieuNaissance || '',
            genre: patient.genre,
            telephone: patient.telephone || '',
            telephoneUrgent: patient.telephoneUrgent || '',
            email: patient.email || '',
            adresse: patient.adresse || '',
            profession: patient.profession || '',
            situationFamiliale: patient.situationFamiliale,
            groupeSanguin: patient.groupeSanguin,
            allergies: patient.allergies || '',
            antecedentsMedicaux: patient.antecedentsMedicaux || '',
            antecedentsChirurgicaux: patient.antecedentsChirurgicaux || '',
            traitementHabituel: patient.traitementHabituel || '',
            mutuelle: patient.mutuelle || '',
            numeroMutuelle: patient.numeroMutuelle || '',
            personneContactNom: patient.personneContactNom || '',
            personneContactLien: patient.personneContactLien || '',
            personneContactTelephone: patient.personneContactTelephone || '',
            consentement: patient.consentement,
          });
        } catch (error) {
          console.error(error);
          toast.error('Erreur lors du chargement du patient');
          router.push('/patients');
        } finally {
          setInitialLoading(false);
        }
      };
      fetchPatient();
    }
  }, [params.id, isEditMode, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.numeroSecuriteSociale?.trim()) newErrors.numeroSecuriteSociale = 'Le numéro de sécurité sociale est requis';
    if (!formData.nom?.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom?.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
    if (!formData.genre) newErrors.genre = 'Le genre est requis';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email invalide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    if (form.checkValidity() === false) {
      setValidated(true);
      return;
    }
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }
    setLoading(true);
    try {
      const dataToSend = {
        ...formData,
        telephone: formData.telephone || null,
        telephoneUrgent: formData.telephoneUrgent || null,
        email: formData.email || null,
        adresse: formData.adresse || null,
        profession: formData.profession || null,
        situationFamiliale: formData.situationFamiliale || null,
        groupeSanguin: formData.groupeSanguin || null,
        allergies: formData.allergies || null,
        antecedentsMedicaux: formData.antecedentsMedicaux || null,
        antecedentsChirurgicaux: formData.antecedentsChirurgicaux || null,
        traitementHabituel: formData.traitementHabituel || null,
        mutuelle: formData.mutuelle || null,
        numeroMutuelle: formData.numeroMutuelle || null,
        personneContactNom: formData.personneContactNom || null,
        personneContactLien: formData.personneContactLien || null,
        personneContactTelephone: formData.personneContactTelephone || null,
        dateNaissance: new Date(formData.dateNaissance).toISOString(),
        consentement: formData.consentement ?? false,
      };
      if (isEditMode && params.id) {
        await patientService.update(Number(params.id), { ...dataToSend, idPatient: Number(params.id) });
        toast.success('Patient mis à jour');
      } else {
        await patientService.create(dataToSend);
        toast.success('Patient créé');
      }
      router.push('/patients');
    } catch (error) {
      console.error(error);
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors as Record<string, string | string[]>;
        const newErrors: Record<string, string> = {};
        Object.keys(validationErrors).forEach(key => {
          const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
          newErrors[fieldName] = Array.isArray(validationErrors[key])
            ? validationErrors[key].join(', ')
            : validationErrors[key];
        });
        setErrors(newErrors);
        toast.error('Veuillez corriger les erreurs');
      } else {
        const apiMessage = extractErrorMessage(error);
        toast.error(apiMessage === 'Une erreur inattendue est survenue'
          ? `Erreur lors de ${isEditMode ? 'la mise à jour' : 'la création'}`
          : apiMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <SkeletonDetails />;

  const situationOptions = [
    { value: '', label: 'Non renseignée' },
    ...Object.entries(SituationFamilialeLabels).map(([val, label]) => ({ value: val, label })),
  ];
  const groupeSanguinOptions = [
    { value: '', label: 'Non renseigné' },
    ...Object.entries(GroupeSanguinLabels).map(([val, label]) => ({ value: val, label })),
  ];

  return (
    <PageShell
      title={isEditMode ? 'Modifier le patient' : 'Nouveau patient'}
      onBack={() => router.push('/patients')}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Identité */}
        <FormSection title="Identité" icon={<FaUser />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="N° Sécurité Sociale"
              name="numeroSecuriteSociale"
              value={formData.numeroSecuriteSociale}
              onChange={handleChange}
              required
              error={errors.numeroSecuriteSociale}
              icon={<FaIdCard />}
              placeholder="1 89 05 78 123 456 78"
            />
            <FormInput label="Nom" name="nom" value={formData.nom} onChange={handleChange} required error={errors.nom} icon={<FaUser />} />
            <FormInput label="Prénom" name="prenom" value={formData.prenom} onChange={handleChange} required error={errors.prenom} icon={<FaUser />} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Date naissance" name="dateNaissance" type="date" value={formData.dateNaissance} onChange={handleChange} required error={errors.dateNaissance} icon={<FaCalendarAlt />} />
            <FormInput label="Lieu naissance" name="lieuNaissance" value={formData.lieuNaissance ?? ''} onChange={handleChange} icon={<FaMapMarkerAlt />} />
            <FormSelect label="Genre" name="genre" value={formData.genre} onChange={handleChange} options={[{ value: 'M', label: 'Masculin' }, { value: 'F', label: 'Féminin' }]} required error={errors.genre} icon={<FaVenusMars />} />
          </div>
        </FormSection>

        {/* Contact */}
        <FormSection title="Contact" icon={<FaPhone />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Téléphone" name="telephone" value={formData.telephone ?? ''} onChange={handleChange} icon={<FaPhone />} />
            <FormInput label="Téléphone urgent" name="telephoneUrgent" value={formData.telephoneUrgent ?? ''} onChange={handleChange} icon={<FaPhone />} />
            <FormInput label="Email" name="email" type="email" value={formData.email ?? ''} onChange={handleChange} error={errors.email} icon={<FaEnvelope />} />
          </div>
          <FormInput label="Adresse" name="adresse" value={formData.adresse ?? ''} onChange={handleChange} icon={<FaMapMarkerAlt />} />
        </FormSection>

        {/* Médical */}
        <FormSection title="Informations médicales" icon={<FaHeart />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormSelect label="Groupe sanguin" name="groupeSanguin" value={formData.groupeSanguin ?? ''} onChange={handleChange} options={groupeSanguinOptions} />
            <FormInput label="Allergies" name="allergies" value={formData.allergies ?? ''} onChange={handleChange} placeholder="Séparer par des virgules" />
            <FormInput label="Antécédents médicaux" name="antecedentsMedicaux" value={formData.antecedentsMedicaux ?? ''} onChange={handleChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput label="Antécédents chirurgicaux" name="antecedentsChirurgicaux" value={formData.antecedentsChirurgicaux ?? ''} onChange={handleChange} />
            <FormInput label="Traitement habituel" name="traitementHabituel" value={formData.traitementHabituel ?? ''} onChange={handleChange} />
          </div>
        </FormSection>

        {/* Socio-professionnel */}
        <FormSection title="Socio-professionnel" icon={<FaBriefcase />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Profession" name="profession" value={formData.profession ?? ''} onChange={handleChange} />
            <FormSelect label="Situation familiale" name="situationFamiliale" value={formData.situationFamiliale ?? ''} onChange={handleChange} options={situationOptions} />
            <FormInput label="Mutuelle" name="mutuelle" value={formData.mutuelle ?? ''} onChange={handleChange} />
          </div>
          <FormInput label="N° Mutuelle" name="numeroMutuelle" value={formData.numeroMutuelle ?? ''} onChange={handleChange} />
        </FormSection>

        {/* Personne de contact */}
        <FormSection title="Personne de contact" icon={<FaUserMd />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput label="Nom complet" name="personneContactNom" value={formData.personneContactNom ?? ''} onChange={handleChange} />
            <FormInput label="Lien" name="personneContactLien" value={formData.personneContactLien ?? ''} onChange={handleChange} placeholder="Parent, conjoint, etc." />
            <FormInput label="Téléphone" name="personneContactTelephone" value={formData.personneContactTelephone ?? ''} onChange={handleChange} />
          </div>
        </FormSection>

        {/* Consentement */}
        <FormSection>
          <div className="flex items-center">
            <input type="checkbox" id="consentement" name="consentement" checked={formData.consentement} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <label htmlFor="consentement" className="ml-2 text-sm text-gray-700">
              J&apos;autorise l&apos;établissement à utiliser mes données médicales pour les soins et la recherche.
            </label>
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection title="Informations complémentaires" icon={<FaFileAlt />}>
          <FormTextarea name="notes" value="" onChange={handleChange} rows={4} placeholder="Informations complémentaires..." />
          <div className="p-3 bg-blue-50 rounded-md text-xs text-blue-700">Les champs marqués d&apos;une étoile (*) sont obligatoires.</div>
        </FormSection>

        <FormActions
          onCancel={() => router.push('/patients')}
          loading={loading}
          loadingLabel="En cours..."
          submitLabel={isEditMode ? 'Mettre à jour' : 'Créer'}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
};

export default PatientFormPage;
