'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaUser, FaIdCard, FaPhone, FaEnvelope, FaMapMarkerAlt, FaCalendarAlt, FaBriefcase, FaDollarSign, FaCamera } from 'react-icons/fa';
import { personnelService } from '@/app/services/personnelService';
import type { PersonnelRequest, PersonnelUpdate, Genre, TypeContrat } from '@/app/types/personnel';
import { GenreLabels, TypeContratLabels } from '@/app/types/personnel';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

interface PersonnelFormProps {
  initialData?: PersonnelUpdate | null;
  isEditMode: boolean;
  id?: number;
}

const genreOptions = Object.entries(GenreLabels).map(([value, label]) => ({ value, label }));
const contratOptions = [
  { value: '', label: 'Non spécifié' },
  ...Object.entries(TypeContratLabels).map(([value, label]) => ({ value, label }))
];

const PersonnelForm: React.FC<PersonnelFormProps> = ({ initialData, isEditMode, id }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fonctionDefaut = searchParams.get('fonction') ?? '';
  const [form, setForm] = useState<PersonnelRequest>(() => initialData ? ({
    matricule: initialData.matricule,
    nom: initialData.nom,
    prenom: initialData.prenom,
    dateNaissance: initialData.dateNaissance ? initialData.dateNaissance.split('T')[0] : null,
    genre: initialData.genre,
    fonction: initialData.fonction,
    service: initialData.service,
    telephone: initialData.telephone,
    email: initialData.email,
    adresse: initialData.adresse,
    dateEmbauche: initialData.dateEmbauche ? initialData.dateEmbauche.split('T')[0] : null,
    salaire: initialData.salaire,
    typeContrat: initialData.typeContrat,
    photo: initialData.photo,
  }) : ({
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: null,
    genre: 'M',
    fonction: fonctionDefaut,
    service: null,
    telephone: null,
    email: null,
    adresse: null,
    dateEmbauche: null,
    salaire: null,
    typeContrat: null,
    photo: null,
  }));
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode && !initialData);

  useEffect(() => {
    if (!initialData && isEditMode && id) {
      personnelService.getById(id).then(data => {
        setForm({
          matricule: data.matricule,
          nom: data.nom,
          prenom: data.prenom,
          dateNaissance: data.dateNaissance ? data.dateNaissance.split('T')[0] : null,
          genre: data.genre,
          fonction: data.fonction,
          service: data.service,
          telephone: data.telephone,
          email: data.email,
          adresse: data.adresse,
          dateEmbauche: data.dateEmbauche ? data.dateEmbauche.split('T')[0] : null,
          salaire: data.salaire,
          typeContrat: data.typeContrat,
          photo: data.photo,
        });
        setFetching(false);
      }).catch(() => {
        toast.error('Erreur chargement');
        router.push('/personnel');
      });
    }
  }, [id, isEditMode, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setForm(prev => ({
        ...prev,
        [name]: value === '' ? null : (type === 'number' ? parseFloat(value) : value),
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.matricule || !form.nom || !form.prenom || !form.fonction || !form.genre) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    setLoading(true);
    try {
      if (isEditMode && id) {
        const updateData: PersonnelUpdate = { ...form, idPersonnel: id };
        await personnelService.update(id, updateData);
        toast.success('Personnel mis à jour');
      } else {
        await personnelService.create(form);
        toast.success('Personnel créé');
      }
      router.push('/personnel');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <SkeletonDetails />;

  return (
    <PageShell
      title={isEditMode ? 'Modifier le personnel' : 'Nouveau personnel'}
      onBack={() => router.push('/personnel')}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section Identité */}
        <FormSection title="Identité" icon={<FaUser />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Matricule "
              name="matricule"
              value={form.matricule}
              onChange={handleChange}
              required
              icon={<FaIdCard />}
            />
            <FormInput
              label="Nom "
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
              icon={<FaUser />}
            />
            <FormInput
              label="Prénom *"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
              icon={<FaUser />}
            />
            <FormInput
              label="Date de naissance"
              name="dateNaissance"
              type="date"
              value={form.dateNaissance || ''}
              onChange={handleChange}
              icon={<FaCalendarAlt />}
            />
            <FormSelect
              label="Genre "
              name="genre"
              value={form.genre}
              onChange={handleChange}
              options={genreOptions}
              required
              icon={<FaUser />}
            />
          </div>
        </FormSection>

        {/* Section Contact */}
        <FormSection title="Contact" icon={<FaPhone />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Téléphone"
              name="telephone"
              value={form.telephone || ''}
              onChange={handleChange}
              icon={<FaPhone />}
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={form.email || ''}
              onChange={handleChange}
              icon={<FaEnvelope />}
            />
            <FormInput
              label="Adresse"
              name="adresse"
              value={form.adresse || ''}
              onChange={handleChange}
              icon={<FaMapMarkerAlt />}
            />
          </div>
        </FormSection>

        {/* Section Professionnelle */}
        <FormSection title="Informations professionnelles" icon={<FaBriefcase />}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Fonction "
              name="fonction"
              value={form.fonction}
              onChange={handleChange}
              required
              icon={<FaBriefcase />}
            />
            <FormInput
              label="Service"
              name="service"
              value={form.service || ''}
              onChange={handleChange}
              icon={<FaBriefcase />}
            />
            <FormSelect
              label="Type de contrat"
              name="typeContrat"
              value={form.typeContrat || ''}
              onChange={handleChange}
              options={contratOptions}
            />
            <FormInput
              label="Date d'embauche"
              name="dateEmbauche"
              type="date"
              value={form.dateEmbauche || ''}
              onChange={handleChange}
              icon={<FaCalendarAlt />}
            />
            <FormInput
              label="Salaire"
              name="salaire"
              type="number"
              step="0.01"
              value={form.salaire ?? ''}
              onChange={handleChange}
              icon={<FaDollarSign />}
            />
          </div>
        </FormSection>

        {/* Section Photo */}
        <FormSection title="Photo" icon={<FaCamera />}>
          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
            <FormInput
              label="URL de la photo"
              name="photo"
              value={form.photo || ''}
              onChange={handleChange}
              icon={<FaCamera />}
              placeholder="https://exemple.com/photo.jpg"
            />
          </div>
        </FormSection>

        {/* Boutons */}
        <FormActions
          onCancel={() => router.push('/personnel')}
          submitLabel="Enregistrer"
          loading={loading}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
};

export default PersonnelForm;
