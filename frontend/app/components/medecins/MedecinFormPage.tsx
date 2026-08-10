// components/medecins/MedecinFormPage.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import {
  FaUser,
  FaIdCard,
  FaVenusMars,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaGraduationCap,
  FaStethoscope,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaFileAlt,
  FaCheckCircle,
  FaBuilding,
  FaArrowLeft,
  FaSave,
  FaCamera,
} from 'react-icons/fa';
import { medecinService } from '@/app/services/medecinService';
import { specialiteService } from '@/app/services/specialiteService';
import PhotoUpload from '../common/PhotoUpload';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import type { MedecinCreate } from '@/app/types/medecin';
import type { Specialite } from '@/app/types/specialite';

const MedecinFormPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const isEditMode = !!params.id;

  const formatDateForInput = (dateString?: string | null): string => {
    if (!dateString) return '';
    if (dateString.includes('T')) return dateString.split('T')[0];
    return dateString;
  };

  const [formData, setFormData] = useState<MedecinCreate>({
    matricule: '',
    nom: '',
    prenom: '',
    dateNaissance: new Date().toISOString().split('T')[0],
    lieuNaissance: '',
    genre: 'M',
    telephone: '',
    email: '',
    adresse: '',
    idSpecialite: undefined,
    qualification: '',
    diplome: '',
    numeroOrdre: '',
    dateEmbauche: new Date().toISOString().split('T')[0],
    salaire: 0,
    disponibilite: 'Disponible',
    photo: '',
    notes: '',
  });

  const [specialites, setSpecialites] = useState<Specialite[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEditMode);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSpecialites = async () => {
      try {
        const data = await specialiteService.getAll({ pageSize: 100 });
        setSpecialites(data.items);
      } catch (error) {
        console.error('Erreur chargement spécialités:', error);
        toast.error('Erreur lors du chargement des spécialités');
      }
    };

    const loadMedecin = async () => {
      if (!params.id) return;
      try {
        setInitialLoading(true);
        const medecin = await medecinService.getById(Number(params.id));
        setFormData({
          matricule: medecin.matricule,
          nom: medecin.nom,
          prenom: medecin.prenom,
          dateNaissance: formatDateForInput(medecin.dateNaissance),
          lieuNaissance: medecin.lieuNaissance || '',
          genre: medecin.genre,
          telephone: medecin.telephone || '',
          email: medecin.email || '',
          adresse: medecin.adresse || '',
          idSpecialite: medecin.idSpecialite,
          qualification: medecin.qualification || '',
          diplome: medecin.diplome || '',
          numeroOrdre: medecin.numeroOrdre || '',
          dateEmbauche:
            formatDateForInput(medecin.dateEmbauche) ||
            new Date().toISOString().split('T')[0],
          salaire: medecin.salaire ?? 0,
          disponibilite: medecin.disponibilite,
          photo: medecin.photo || '',
          notes: medecin.notes || '',
        });
      } catch (error) {
        console.error('Erreur chargement médecin:', error);
        toast.error('Erreur lors du chargement du médecin');
        router.push('/medecins');
      } finally {
        setInitialLoading(false);
      }
    };

    loadSpecialites();
    if (isEditMode) loadMedecin();
  }, [params.id, isEditMode, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));

    if (type === 'number') {
      setFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : Number(value) }));
      return;
    }

    if (type === 'select-one') {
      if (name === 'genre' || name === 'disponibilite') {
        setFormData((prev) => ({ ...prev, [name]: value }));
        return;
      }
      const numValue = value === '' ? undefined : Number(value);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (url: string) => setFormData((prev) => ({ ...prev, photo: url }));
  const handlePhotoRemove = () => setFormData((prev) => ({ ...prev, photo: '' }));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.matricule?.trim()) newErrors.matricule = 'Le matricule est requis';
    if (!formData.nom?.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.prenom?.trim()) newErrors.prenom = 'Le prénom est requis';
    if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
    if (!formData.lieuNaissance?.trim()) newErrors.lieuNaissance = 'Le lieu de naissance est requis';
    if (formData.genre === undefined || formData.genre === null)
      newErrors.genre = 'Le genre est requis';
    if (!formData.telephone?.trim()) newErrors.telephone = 'Le téléphone est requis';
    if (!formData.email?.trim()) newErrors.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Email invalide';
    if (!formData.adresse?.trim()) newErrors.adresse = "L'adresse est requise";
    if (!formData.qualification?.trim()) newErrors.qualification = 'La qualification est requise';
    if (!formData.diplome?.trim()) newErrors.diplome = 'Le diplôme est requis';
    if (!formData.numeroOrdre?.trim()) newErrors.numeroOrdre = "Le numéro d'ordre est requis";
    if (!formData.dateEmbauche) newErrors.dateEmbauche = "La date d'embauche est requise";
    if (formData.salaire === undefined || formData.salaire === null)
      newErrors.salaire = 'Le salaire est requis';
    if (formData.disponibilite === undefined || formData.disponibilite === null)
      newErrors.disponibilite = 'La disponibilité est requise';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }

    setLoading(true);
    try {
      // Conversion des dates en format LocalDateTime (avec heure)
      const dateNaissanceValue = formData.dateNaissance ? `${formData.dateNaissance}T00:00:00` : null;
      const dateEmbaucheValue = formData.dateEmbauche ? `${formData.dateEmbauche}T00:00:00` : null;

      const dataToSend = {
        ...formData,
        notes: formData.notes || null,
        photo: formData.photo || null,
        dateNaissance: dateNaissanceValue,
        dateEmbauche: dateEmbaucheValue,
        salaire: Number(formData.salaire),
        idSpecialite: formData.idSpecialite,
      };

      if (isEditMode && params.id) {
        await medecinService.update(Number(params.id), { ...dataToSend, idMedecin: Number(params.id) });
        toast.success('Médecin mis à jour');
      } else {
        await medecinService.create(dataToSend);
        toast.success('Médecin créé');
      }
      router.push('/medecins');
    } catch (error) {
      if (!isAxiosError(error)) {
        console.error('Erreur inconnue:', error);
        toast.error('Une erreur inattendue est survenue');
        return;
      }
      const responseData = error.response?.data;
      if (responseData?.errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(responseData.errors).forEach((key) => {
          const fieldName = key.charAt(0).toLowerCase() + key.slice(1);
          newErrors[fieldName] = Array.isArray(responseData.errors[key])
            ? responseData.errors[key].join(', ')
            : responseData.errors[key];
        });
        setErrors(newErrors);
        toast.error('Veuillez corriger les erreurs dans le formulaire');
      } else if (responseData?.message) {
        toast.error(responseData.message);
      } else {
        toast.error(`Erreur lors de ${isEditMode ? 'la mise à jour' : 'la création'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <SkeletonDetails />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEditMode ? 'Modifier le médecin' : 'Nouveau médecin'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/medecins')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale - formulaire */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
              <div className="p-6 space-y-8">
                {/* Section Informations personnelles */}
                <div>
                  <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2 mb-4">
                    <FaUser /> Informations personnelles
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Matricule"
                      name="matricule"
                      value={formData.matricule}
                      onChange={handleChange}
                      required
                      error={errors.matricule}
                      icon={<FaIdCard />}
                      placeholder="MED-2024-001"
                      aria-required
                    />
                    <FormInput
                      label="Nom"
                      name="nom"
                      value={formData.nom}
                      onChange={handleChange}
                      required
                      error={errors.nom}
                      icon={<FaUser />}
                      placeholder="Dupont"
                    />
                    <FormInput
                      label="Prénom"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      required
                      error={errors.prenom}
                      icon={<FaUser />}
                      placeholder="Jean"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormInput
                      label="Date de naissance"
                      name="dateNaissance"
                      type="date"
                      value={formData.dateNaissance ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.dateNaissance}
                      icon={<FaCalendarAlt />}
                    />
                    <FormInput
                      label="Lieu de naissance"
                      name="lieuNaissance"
                      value={formData.lieuNaissance ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.lieuNaissance}
                      icon={<FaMapMarkerAlt />}
                      placeholder="Paris"
                    />
                    <FormSelect
                      label="Genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      options={[
                        { value: 'M', label: 'Masculin' },
                        { value: 'F', label: 'Féminin' },
                      ]}
                      required
                      error={errors.genre}
                      icon={<FaVenusMars />}
                    />
                  </div>
                </div>

                {/* Section Contact */}
                <div>
                  <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2 mb-4">
                    <FaPhone /> Contact
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormInput
                      label="Téléphone"
                      name="telephone"
                      value={formData.telephone ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.telephone}
                      icon={<FaPhone />}
                      placeholder="01 23 45 67 89"
                    />
                    <FormInput
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.email}
                      icon={<FaEnvelope />}
                      placeholder="jean.dupont@hopital.fr"
                    />
                    <FormInput
                      label="Adresse"
                      name="adresse"
                      value={formData.adresse ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.adresse}
                      icon={<FaMapMarkerAlt />}
                      placeholder="123 rue de la Paix"
                    />
                  </div>
                </div>

                {/* Section Professionnelle */}
                <div>
                  <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2 mb-4">
                    <FaStethoscope /> Informations professionnelles
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormSelect
                      label="Spécialité"
                      name="idSpecialite"
                      value={formData.idSpecialite ?? ''}
                      onChange={handleChange}
                      options={[
                        { value: '', label: 'Sélectionner' },
                        ...specialites.map((spec) => ({
                          value: spec.idSpecialite,
                          label: spec.nomSpecialite,
                        })),
                      ]}
                      error={errors.idSpecialite}
                      icon={<FaBuilding />}
                    />
                    <FormInput
                      label="Qualification"
                      name="qualification"
                      value={formData.qualification ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.qualification}
                      icon={<FaGraduationCap />}
                      placeholder="Spécialiste en cardiologie"
                    />
                    <FormInput
                      label="Diplôme"
                      name="diplome"
                      value={formData.diplome ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.diplome}
                      icon={<FaGraduationCap />}
                      placeholder="Doctorat en médecine"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <FormInput
                      label="Numéro d'ordre"
                      name="numeroOrdre"
                      value={formData.numeroOrdre ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.numeroOrdre}
                      icon={<FaIdCard />}
                      placeholder="12345"
                    />
                    <FormInput
                      label="Date d'embauche"
                      name="dateEmbauche"
                      type="date"
                      value={formData.dateEmbauche ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.dateEmbauche}
                      icon={<FaCalendarAlt />}
                    />
                    <FormInput
                      label="Salaire (€)"
                      name="salaire"
                      type="number"
                      value={formData.salaire ?? ''}
                      onChange={handleChange}
                      required
                      error={errors.salaire}
                      icon={<FaMoneyBillWave />}
                      placeholder="5000"
                      step="100"
                    />
                  </div>

                  <div className="mt-4">
                    <FormSelect
                      label="Disponibilité"
                      name="disponibilite"
                      value={formData.disponibilite}
                      onChange={handleChange}
                      options={[
                        { value: 'Disponible', label: 'Disponible' },
                        { value: 'EnConge', label: 'En congé' },
                        { value: 'Absent', label: 'Absent' },
                        { value: 'EnFormation', label: 'En formation' },
                      ]}
                      required
                      error={errors.disponibilite}
                      icon={<FaCheckCircle />}
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2 mb-4">
                    <FaFileAlt /> Notes
                  </h5>
                  <FormTextarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    error={errors.notes}
                    rows={4}
                    placeholder="Informations complémentaires..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite - Photo */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaCamera className="text-indigo-500" /> Photo du médecin
                </h5>
              </div>
              <div className="p-6">
                <PhotoUpload
                  currentPhoto={formData.photo || undefined}
                  onPhotoChange={handlePhotoChange}
                  onPhotoRemove={handlePhotoRemove}
                  name={`${formData.prenom} ${formData.nom}`}
                />
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
                  <strong>Formats acceptés :</strong> JPG, PNG, GIF
                  <br />
                  <strong>Taille max :</strong> 5 Mo
                  <br />
                  <strong>Dimensions recommandées :</strong> 400x400px
                  <br />
                  La photo sera uploadée après l&apos;enregistrement du médecin.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="secondary" onClick={() => router.push('/medecins')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : (isEditMode ? 'Mettre à jour' : 'Créer')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MedecinFormPage;