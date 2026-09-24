'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaUserMd, FaCalendarAlt, FaClipboardList, FaHeartbeat, FaFileAlt } from 'react-icons/fa';

import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { chambreService } from '@/app/services/chambreService';
import { hospitalisationService } from '@/app/services/hospitalisationService';
import { HospitalisationCreate, ModeEntreeHospitalisation, ModeSortieHospitalisation, StatutHospitalisation } from '@/app/types/hospitalisation';
import { Chambre } from '@/app/types/chambre';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

const modeEntreeOptions = Object.values(ModeEntreeHospitalisation).map(m => ({ value: m, label: m }));
const statutOptions = Object.values(StatutHospitalisation).map(s => ({ value: s, label: s }));
const modeSortieOptions = Object.values(ModeSortieHospitalisation).map(m => ({ value: m, label: m }));

interface HospitalisationFormProps {
  initialData?: HospitalisationCreate & { idHospitalisation?: number };
  isEditing?: boolean;
}

export default function HospitalisationForm({ initialData, isEditing = false }: HospitalisationFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [formData, setFormData] = useState<Partial<HospitalisationCreate>>(() => initialData ? {
    numeroAdmission: initialData.numeroAdmission || '',
    idPatient: initialData.idPatient,
    idChambre: initialData.idChambre,
    idMedecinResponsable: initialData.idMedecinResponsable,
    dateAdmission: initialData.dateAdmission ? new Date(initialData.dateAdmission).toISOString().slice(0, 16) : '',
    dateSortie: initialData.dateSortie ? new Date(initialData.dateSortie).toISOString().slice(0, 16) : null,
    motifAdmission: initialData.motifAdmission || '',
    modeEntree: initialData.modeEntree || ModeEntreeHospitalisation.Urgences,
    provenance: initialData.provenance || '',
    diagnosticPrincipal: initialData.diagnosticPrincipal || '',
    traitementsEnCours: initialData.traitementsEnCours || '',
    examensRealises: initialData.examensRealises || '',
    regimeAlimentaire: initialData.regimeAlimentaire || '',
    consignesParticulieres: initialData.consignesParticulieres || '',
    statut: initialData.statut || StatutHospitalisation.En_cours,
    notesSortie: initialData.notesSortie || '',
    modeSortie: initialData.modeSortie || null,
    destinationSortie: initialData.destinationSortie || '',
  } : {
    numeroAdmission: '',
    idPatient: null,
    idChambre: null,
    idMedecinResponsable: null,
    dateAdmission: new Date().toISOString().slice(0, 16),
    dateSortie: null,
    motifAdmission: '',
    modeEntree: ModeEntreeHospitalisation.Urgences,
    provenance: '',
    diagnosticPrincipal: '',
    traitementsEnCours: '',
    examensRealises: '',
    regimeAlimentaire: '',
    consignesParticulieres: '',
    statut: StatutHospitalisation.En_cours,
    notesSortie: '',
    modeSortie: null,
    destinationSortie: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    chambreService.getAll(1, 1000).then(res => setChambres(res.items)).catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handlePatientChange = (id: number | null) => {
    setFormData(prev => ({ ...prev, idPatient: id }));
    if (errors.idPatient) setErrors(prev => ({ ...prev, idPatient: '' }));
  };
  const handleMedecinChange = (id: number | null) => {
    setFormData(prev => ({ ...prev, idMedecinResponsable: id }));
    if (errors.idMedecinResponsable) setErrors(prev => ({ ...prev, idMedecinResponsable: '' }));
  };

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.idPatient) err.idPatient = 'Patient requis';
    if (!formData.idMedecinResponsable) err.idMedecinResponsable = 'Médecin responsable requis';
    if (!formData.motifAdmission?.trim()) err.motifAdmission = 'Motif requis';
    if (!formData.dateAdmission) err.dateAdmission = 'Date d\'admission requise';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;
  setLoading(true);
  try {
    const dataToSend = {
      ...formData,
      dateAdmission: new Date(formData.dateAdmission!).toISOString(),
      dateSortie: formData.dateSortie ? new Date(formData.dateSortie).toISOString() : null,
      idPatient: Number(formData.idPatient),
      idMedecinResponsable: Number(formData.idMedecinResponsable),
      idChambre: formData.idChambre ? Number(formData.idChambre) : null,
    };
    // 🔥 Supprimer le champ s'il est vide (pour que le backend le génère)
    if (dataToSend.numeroAdmission === '') {
      delete dataToSend.numeroAdmission;
    }
    if (isEditing && initialData?.idHospitalisation) {
      await hospitalisationService.update(initialData.idHospitalisation, dataToSend);
      toast.success('Hospitalisation mise à jour');
    } else {
      await hospitalisationService.create(dataToSend as HospitalisationCreate);
      toast.success('Admission enregistrée');
    }
    router.push('/patients/hospitalisations');
  } catch (error) {
    console.error('Erreur détaillée :', error);
    toast.error(extractErrorMessage(error));
  } finally {
    setLoading(false);
  }
};

  if (loading) return <SkeletonDetails />;

  return (
    <PageShell
      title={isEditing ? 'Modifier l\'hospitalisation' : 'Nouvelle hospitalisation'}
      onBack={() => router.push('/patients/hospitalisations')}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Admission */}
        <FormSection title="Admission" icon={<FaClipboardList />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PatientSearchSelect
              value={formData.idPatient ?? null}
              onChange={handlePatientChange}
              error={errors.idPatient}
              required
            />
            <MedecinSearchSelect
              value={formData.idMedecinResponsable ?? null}
              onChange={handleMedecinChange}
              error={errors.idMedecinResponsable}
              required
            />
            <FormInput
              label="Numéro admission"
              name="numeroAdmission"
              value={formData.numeroAdmission || ''}
              onChange={handleChange}
              placeholder="Auto-généré si vide"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
              <select
                name="idChambre"
                value={formData.idChambre || ''}
                onChange={handleChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm py-2"
              >
                <option value="">Aucune</option>
                {chambres.map(c => (
                  <option key={c.idChambre} value={c.idChambre}>
                    {c.numeroChambre} - {c.typeChambre}
                  </option>
                ))}
              </select>
            </div>
            <FormInput
              label="Date d'admission"
              name="dateAdmission"
              type="datetime-local"
              value={formData.dateAdmission || ''}
              onChange={handleChange}
              required
              error={errors.dateAdmission}
              icon={<FaCalendarAlt />}
            />
            <FormInput
              label="Date de sortie"
              name="dateSortie"
              type="datetime-local"
              value={formData.dateSortie || ''}
              onChange={handleChange}
            />
            <FormSelect
              label="Mode d'entrée"
              name="modeEntree"
              value={formData.modeEntree || ''}
              onChange={handleChange}
              options={modeEntreeOptions}
            />
            <FormInput
              label="Provenance"
              name="provenance"
              value={formData.provenance || ''}
              onChange={handleChange}
            />
          </div>
        </FormSection>

        {/* Médical */}
        <FormSection title="Informations médicales" icon={<FaHeartbeat />}>
          <div className="grid grid-cols-1 gap-4">
            <FormTextarea
              label="Motif d'admission"
              name="motifAdmission"
              value={formData.motifAdmission || ''}
              onChange={handleChange}
              rows={2}
              required
              error={errors.motifAdmission}
            />
            <FormTextarea
              label="Diagnostic principal"
              name="diagnosticPrincipal"
              value={formData.diagnosticPrincipal || ''}
              onChange={handleChange}
              rows={2}
            />
            <FormTextarea
              label="Traitements en cours"
              name="traitementsEnCours"
              value={formData.traitementsEnCours || ''}
              onChange={handleChange}
              rows={2}
            />
            <FormTextarea
              label="Examens réalisés"
              name="examensRealises"
              value={formData.examensRealises || ''}
              onChange={handleChange}
              rows={2}
            />
            <FormInput
              label="Régime alimentaire"
              name="regimeAlimentaire"
              value={formData.regimeAlimentaire || ''}
              onChange={handleChange}
            />
            <FormTextarea
              label="Consignes particulières"
              name="consignesParticulieres"
              value={formData.consignesParticulieres || ''}
              onChange={handleChange}
              rows={2}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormSelect
                label="Statut"
                name="statut"
                value={formData.statut || ''}
                onChange={handleChange}
                options={statutOptions}
              />
              <FormSelect
                label="Mode de sortie"
                name="modeSortie"
                value={formData.modeSortie || ''}
                onChange={handleChange}
                options={modeSortieOptions}
              />
              <FormInput
                label="Destination sortie"
                name="destinationSortie"
                value={formData.destinationSortie || ''}
                onChange={handleChange}
              />
            </div>
            <FormTextarea
              label="Notes de sortie"
              name="notesSortie"
              value={formData.notesSortie || ''}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </FormSection>

        {/* Colonne notes (optionnelle) */}
        <FormSection title="Informations complémentaires" icon={<FaFileAlt />}>
          <FormTextarea
            name="notes"
            value=""
            onChange={() => { }}
            rows={4}
            placeholder="Informations complémentaires..."
          />
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
            Les champs marqués d&apos;une étoile (*) sont obligatoires.
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push('/patients/hospitalisations')}
          loading={loading}
          loadingLabel="En cours..."
          submitLabel={isEditing ? 'Mettre à jour' : 'Créer'}
          submitIcon={<FaUserMd />}
        />
      </form>
    </PageShell>
  );
}
