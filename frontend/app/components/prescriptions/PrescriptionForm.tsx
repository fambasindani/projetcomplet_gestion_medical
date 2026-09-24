'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaCalendarAlt, FaPlus, FaTrash, FaSearch, FaPen } from 'react-icons/fa';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';
import { PatientSearchSelect } from '../common/PatientSearchSelect';
import { MedecinSearchSelect } from '../common/MedecinSearchSelect';
import { MedicamentSearchSelect } from '../common/MedicamentSearchSelect';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import Button from '@/app/ui/Button';
import { prescriptionService } from '@/app/services/prescriptionService';
import { examenService } from '@/app/services/examenService';
import { soinPrescritService } from '@/app/services/soinPrescritService';
import { categorieExamenService } from '@/app/services/categorieExamenService';
import { TypePrescription, StatutPrescription, PrescriptionCreate, PrescriptionMedicamentCreate, PrescriptionExamen } from '@/app/types/prescription';
import { StatutExamen, ConfidentialiteExamen, STATUT_EXAMEN_OPTIONS, CONFIDENTIALITE_OPTIONS, CategorieExamen } from '@/app/types/examen';
import { StatutSoin, STATUT_SOIN_OPTIONS, PrescriptionSoin } from '@/app/types/soin';

const typeOptions = Object.values(TypePrescription).map(t => ({ value: t, label: t }));
const statutOptions = Object.values(StatutPrescription).map(s => ({ value: s, label: s }));

interface Props {
  initialData?: PrescriptionCreate & { idPrescription?: number };
  isEditing?: boolean;
}

// Lignes de médicaments
interface MedicamentLine {
  id?: number;
  nomLibre?: string;
  posologie: string;
  dureeTraitement: string;
  quantitePrescrite: number;
  instructions: string;
  isCustom: boolean;
}

export default function PrescriptionForm({ initialData, isEditing = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlType = searchParams.get('type') as TypePrescription | null;

  const initialType = urlType && Object.values(TypePrescription).includes(urlType)
    ? urlType
    : TypePrescription.Medicament;

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategorieExamen[]>([]);
  const [formData, setFormData] = useState<PrescriptionCreate>(() => initialData ? {
    ...initialData,
    datePrescription: initialData.datePrescription?.slice(0, 16) || '',
    prescriptionsMedicaments: initialData.prescriptionsMedicaments || []
  } : {
    idPatient: 0,
    idMedecin: 0,
    datePrescription: new Date().toISOString().slice(0, 16),
    typePrescription: initialType,
    description: '',
    instructions: '',
    urgente: false,
    statut: StatutPrescription.Active,
    idConsultation: null,
    idHospitalisation: null,
    dateDebut: null,
    dateFin: null,
    notesComplementaires: '',
    prescriptionsMedicaments: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Médicaments
  const [medicaments, setMedicaments] = useState<MedicamentLine[]>(() => initialData?.prescriptionsMedicaments
    ? initialData.prescriptionsMedicaments.map((m: PrescriptionMedicamentCreate) => ({
        id: m.idMedicament,
        nomLibre: m.medicamentNom || '',
        posologie: m.posologie,
        dureeTraitement: m.dureeTraitement || '',
        quantitePrescrite: m.quantitePrescrite,
        instructions: m.instructions || '',
        isCustom: !m.idMedicament
      }))
    : []);
  const [newMedicament, setNewMedicament] = useState<MedicamentLine>({
    id: undefined,
    nomLibre: '',
    posologie: '',
    dureeTraitement: '',
    quantitePrescrite: 1,
    instructions: '',
    isCustom: false
  });
  const [customMode, setCustomMode] = useState(false);

  // Examens
  const [examens, setExamens] = useState<PrescriptionExamen[]>([]);
  const [newExamen, setNewExamen] = useState({
    typeExamen: '',
    idCategorieExamen: 0,
    datePlanification: '',
    dateRealisation: '',
    laboratoire: '',
    technicien: '',
    statut: 'Prescrit' as StatutExamen,
    confidentialite: 'Normal' as ConfidentialiteExamen
  });

  // Soins
  const [soins, setSoins] = useState<PrescriptionSoin[]>([]);
  const [newSoin, setNewSoin] = useState<PrescriptionSoin>({
    description: '',
    instructions: '',
    frequence: '',
    duree: '',
    statut: StatutSoin.Prescrit
  });

  useEffect(() => {
    categorieExamenService.getAllList().then(setCategories).catch(console.error);
  }, []);

  // Gestionnaires communs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePatientChange = (id: number | null) => setFormData(prev => ({ ...prev, idPatient: id || 0 }));
  const handleMedecinChange = (id: number | null) => setFormData(prev => ({ ...prev, idMedecin: id || 0 }));

  // ---- Médicaments ----
  const handleAddMedicament = () => {
    if (customMode && !newMedicament.nomLibre?.trim()) {
      toast.error('Veuillez saisir un nom de médicament');
      return;
    }
    if (!customMode && !newMedicament.id) {
      toast.error('Veuillez sélectionner un médicament');
      return;
    }
    if (!newMedicament.posologie) {
      toast.error('La posologie est requise');
      return;
    }
    setMedicaments(prev => [...prev, { ...newMedicament }]);
    setNewMedicament({
      id: undefined,
      nomLibre: '',
      posologie: '',
      dureeTraitement: '',
      quantitePrescrite: 1,
      instructions: '',
      isCustom: false
    });
    setCustomMode(false);
  };

  const handleRemoveMedicament = (index: number) => {
    setMedicaments(prev => prev.filter((_, i) => i !== index));
  };

  const handleMedicamentSelect = (id: number, nom: string) => {
    setNewMedicament({
      id: id,
      nomLibre: nom,
      posologie: '',
      dureeTraitement: '',
      quantitePrescrite: 1,
      instructions: '',
      isCustom: false
    });
    setCustomMode(false);
  };

  const toggleCustomMode = () => {
    setCustomMode(!customMode);
    setNewMedicament({
      id: undefined,
      nomLibre: '',
      posologie: '',
      dureeTraitement: '',
      quantitePrescrite: 1,
      instructions: '',
      isCustom: !customMode
    });
  };

  // ---- Examens ----
  const handleAddExamen = () => {
    if (!newExamen.typeExamen || !newExamen.idCategorieExamen) {
      toast.error('Type et catégorie requis');
      return;
    }
    setExamens(prev => [...prev, { ...newExamen }]);
    setNewExamen({
      typeExamen: '',
      idCategorieExamen: 0,
      datePlanification: '',
      dateRealisation: '',
      laboratoire: '',
      technicien: '',
      statut: 'Prescrit' as StatutExamen,
      confidentialite: 'Normal' as ConfidentialiteExamen
    });
  };

  const handleRemoveExamen = (index: number) => {
    setExamens(prev => prev.filter((_, i) => i !== index));
  };

  // ---- Soins ----
  const handleAddSoin = () => {
    if (!newSoin.description) {
      toast.error('Description requise');
      return;
    }
    setSoins(prev => [...prev, { ...newSoin }]);
    setNewSoin({
      description: '',
      instructions: '',
      frequence: '',
      duree: '',
      statut: StatutSoin.Prescrit
    });
  };

  const handleRemoveSoin = (index: number) => {
    setSoins(prev => prev.filter((_, i) => i !== index));
  };

  // ---- Validation ----
  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.idPatient) err.idPatient = 'Patient requis';
    if (!formData.idMedecin) err.idMedecin = 'Médecin requis';
    if (!formData.datePrescription) err.datePrescription = 'Date requise';
    if (!formData.description?.trim()) err.description = 'Description requise';
    if (formData.typePrescription === TypePrescription.Medicament && medicaments.length === 0) {
      err.medicaments = 'Au moins un médicament est requis';
    }
    if (formData.typePrescription === TypePrescription.Examen && examens.length === 0) {
      err.examens = 'Au moins un examen est requis';
    }
    if (formData.typePrescription === TypePrescription.Soin && soins.length === 0) {
      err.soins = 'Au moins un soin est requis';
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ---- Soumission ----
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // Créer la prescription
      const payload = {
        ...formData,
        datePrescription: new Date(formData.datePrescription).toISOString(),
        dateDebut: formData.dateDebut ? new Date(formData.dateDebut).toISOString() : null,
        dateFin: formData.dateFin ? new Date(formData.dateFin).toISOString() : null,
        prescriptionsMedicaments: formData.typePrescription === TypePrescription.Medicament
          ? medicaments.map(m => ({
              idMedicament: m.id || 0,
              medicamentNom: m.nomLibre,
              posologie: m.posologie,
              dureeTraitement: m.dureeTraitement,
              quantitePrescrite: m.quantitePrescrite,
              instructions: m.instructions,
              isCustom: m.isCustom
            }))
          : undefined
      };

      let prescriptionResponse;
      if (isEditing && initialData?.idPrescription) {
        prescriptionResponse = await prescriptionService.update(initialData.idPrescription, payload);
        toast.success('Prescription modifiée');
      } else {
        prescriptionResponse = await prescriptionService.create(payload);
        toast.success('Prescription créée');
      }
      const prescriptionId = prescriptionResponse.idPrescription;

      // ---- Création des examens ----
      if (formData.typePrescription === TypePrescription.Examen && examens.length > 0) {
        const examensPayload = examens.map(e => ({
          ...e,
          idPatient: formData.idPatient,
          idMedecinPrescripteur: formData.idMedecin,
          idPrescription: prescriptionId,
          datePrescription: new Date().toISOString()
        }));
        await examenService.createBatch({ idPrescription: prescriptionId, examens: examensPayload });
        toast.success(`${examens.length} examen(s) créé(s)`);
      }

      // ---- Création des soins ----
      if (formData.typePrescription === TypePrescription.Soin && soins.length > 0) {
        for (const s of soins) {
          await soinPrescritService.create({
            idPrescription: prescriptionId,
            idPatient: formData.idPatient,
            description: s.description,
            instructions: s.instructions,
            frequence: s.frequence,
            duree: s.duree,
            statut: s.statut
          });
        }
        toast.success(`${soins.length} soin(s) créé(s)`);
      }

      router.push('/prescriptions');
    } catch (error) {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    if (isEditing) return 'Modifier la prescription';
    switch (formData.typePrescription) {
      case TypePrescription.Medicament: return 'Nouvelle prescription médicament';
      case TypePrescription.Examen: return 'Nouvelle prescription examen';
      case TypePrescription.Soin: return 'Nouvelle prescription soin';
      default: return 'Nouvelle prescription';
    }
  };

  return (
    <PageShell title={getTitle()} maxWidth="max-w-6xl" onBack={() => router.back()}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection>
          {/* Patient et Médecin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PatientSearchSelect value={formData.idPatient} onChange={handlePatientChange} error={errors.idPatient} required />
            <MedecinSearchSelect value={formData.idMedecin} onChange={handleMedecinChange} error={errors.idMedecin} required />
          </div>

          {/* Date, Type, Statut, Urgence */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <FormInput label="Date de prescription" name="datePrescription" type="datetime-local" value={formData.datePrescription} onChange={handleChange} required error={errors.datePrescription} icon={<FaCalendarAlt />} />
            <FormSelect label="Type" name="typePrescription" value={formData.typePrescription} onChange={handleChange} options={typeOptions} />
            <FormSelect label="Statut" name="statut" value={formData.statut} onChange={handleChange} options={statutOptions} />
            <div className="flex items-center pt-6">
              <input type="checkbox" id="urgente" name="urgente" checked={formData.urgente} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              <label htmlFor="urgente" className="ml-2 text-sm">Urgente</label>
            </div>
          </div>

          {/* Description et Instructions */}
          <FormTextarea label="Description" name="description" value={formData.description} onChange={handleChange} rows={3} required error={errors.description} />
          <FormTextarea label="Instructions" name="instructions" value={formData.instructions || ''} onChange={handleChange} rows={2} />

          {/* Section Médicaments */}
          {formData.typePrescription === TypePrescription.Medicament && (
            <FormSection title="Médicaments prescrits" className="bg-slate-50">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Ajouter un médicament</span>
                  <button type="button" onClick={toggleCustomMode} className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                    {customMode ? <FaSearch /> : <FaPen />} {customMode ? 'Utiliser la pharmacie' : 'Saisie libre'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 items-end">
                  {customMode ? (
                    <input type="text" placeholder="Nom du médicament" value={newMedicament.nomLibre || ''} onChange={e => setNewMedicament(prev => ({ ...prev, nomLibre: e.target.value, isCustom: true }))} className="col-span-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  ) : (
                    <div className="col-span-2">
                      <MedicamentSearchSelect value={newMedicament.id || null} onChange={(id, nom) => id && handleMedicamentSelect(id, nom || '')} placeholder="Rechercher..." />
                    </div>
                  )}
                  <input type="text" placeholder="Posologie *" value={newMedicament.posologie} onChange={e => setNewMedicament(prev => ({ ...prev, posologie: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <input type="text" placeholder="Durée" value={newMedicament.dureeTraitement} onChange={e => setNewMedicament(prev => ({ ...prev, dureeTraitement: e.target.value }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <input type="number" placeholder="Qté" value={newMedicament.quantitePrescrite} onChange={e => setNewMedicament(prev => ({ ...prev, quantitePrescrite: parseInt(e.target.value) || 1 }))} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <Button type="button" onClick={handleAddMedicament} icon={<FaPlus />}>Ajouter</Button>
                </div>
                <input type="text" placeholder="Instructions spécifiques" value={newMedicament.instructions} onChange={e => setNewMedicament(prev => ({ ...prev, instructions: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
              </div>
              {medicaments.length > 0 && (
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full divide-y text-sm">
                    <thead className="bg-slate-50"><tr><th>Médicament</th><th>Posologie</th><th>Durée</th><th>Qté</th><th>Instructions</th><th></th></tr></thead>
                    <tbody>
                      {medicaments.map((med, idx) => (
                        <tr key={idx} className="border-t"><td className="px-4 py-2">{med.isCustom ? med.nomLibre : `[${med.id}] ${med.nomLibre}`}</td><td>{med.posologie}</td><td>{med.dureeTraitement || '-'}</td><td>{med.quantitePrescrite}</td><td>{med.instructions || '-'}</td><td><button type="button" onClick={() => handleRemoveMedicament(idx)} className="text-red-500"><FaTrash /></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {errors.medicaments && <p className="text-sm text-red-600">{errors.medicaments}</p>}
            </FormSection>
          )}

          {/* Section Examens */}
          {formData.typePrescription === TypePrescription.Examen && (
            <FormSection title="Examens prescrits" className="bg-slate-50">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="text" placeholder="Type d'examen *" value={newExamen.typeExamen} onChange={e => setNewExamen({...newExamen, typeExamen: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <select value={newExamen.idCategorieExamen} onChange={e => setNewExamen({...newExamen, idCategorieExamen: parseInt(e.target.value)})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                    <option value={0}>Catégorie *</option>
                    {categories.map((c: CategorieExamen) => <option key={c.idCategorieExamen} value={c.idCategorieExamen}>{c.libelle}</option>)}
                  </select>
                  <input type="datetime-local" value={newExamen.datePlanification || ''} onChange={e => setNewExamen({...newExamen, datePlanification: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <input type="datetime-local" value={newExamen.dateRealisation || ''} onChange={e => setNewExamen({...newExamen, dateRealisation: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <input type="text" placeholder="Laboratoire" value={newExamen.laboratoire || ''} onChange={e => setNewExamen({...newExamen, laboratoire: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <input type="text" placeholder="Technicien" value={newExamen.technicien || ''} onChange={e => setNewExamen({...newExamen, technicien: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <select value={newExamen.statut} onChange={e => setNewExamen({...newExamen, statut: e.target.value as StatutExamen})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                    {STATUT_EXAMEN_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={newExamen.confidentialite} onChange={e => setNewExamen({...newExamen, confidentialite: e.target.value as ConfidentialiteExamen})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                    {CONFIDENTIALITE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Button type="button" onClick={handleAddExamen} icon={<FaPlus />}>Ajouter examen</Button>
              </div>
              {examens.length > 0 && (
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full divide-y text-sm">
                    <thead><tr><th>Type</th><th>Catégorie</th><th>Statut</th><th>Planification</th><th></th></tr></thead>
                    <tbody>
                      {examens.map((ex, idx) => (
                        <tr key={idx} className="border-t"><td>{ex.typeExamen}</td><td>{categories.find(c => c.idCategorieExamen === ex.idCategorieExamen)?.libelle || ex.idCategorieExamen}</td><td>{ex.statut}</td><td>{ex.datePlanification || '-'}</td><td><button type="button" onClick={() => handleRemoveExamen(idx)} className="text-red-500"><FaTrash /></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {errors.examens && <p className="text-sm text-red-600">{errors.examens}</p>}
            </FormSection>
          )}

          {/* Section Soins */}
          {formData.typePrescription === TypePrescription.Soin && (
            <FormSection title="Soins prescrits" className="bg-slate-50">
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input type="text" placeholder="Description *" value={newSoin.description} onChange={e => setNewSoin({...newSoin, description: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <input type="text" placeholder="Instructions" value={newSoin.instructions || ''} onChange={e => setNewSoin({...newSoin, instructions: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="text" placeholder="Fréquence" value={newSoin.frequence || ''} onChange={e => setNewSoin({...newSoin, frequence: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <input type="text" placeholder="Durée" value={newSoin.duree || ''} onChange={e => setNewSoin({...newSoin, duree: e.target.value})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100" />
                  <select value={newSoin.statut} onChange={e => setNewSoin({...newSoin, statut: e.target.value as StatutSoin})} className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100">
                    {STATUT_SOIN_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </select>
                </div>
                <Button type="button" onClick={handleAddSoin} icon={<FaPlus />}>Ajouter soin</Button>
              </div>
              {soins.length > 0 && (
                <div className="overflow-x-auto mt-2">
                  <table className="min-w-full divide-y text-sm">
                    <thead><tr><th>Description</th><th>Fréquence</th><th>Durée</th><th>Statut</th><th></th></tr></thead>
                    <tbody>
                      {soins.map((s, idx) => (
                        <tr key={idx} className="border-t"><td>{s.description}</td><td>{s.frequence || '-'}</td><td>{s.duree || '-'}</td><td>{s.statut}</td><td><button type="button" onClick={() => handleRemoveSoin(idx)} className="text-red-500"><FaTrash /></button></td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {errors.soins && <p className="text-sm text-red-600">{errors.soins}</p>}
            </FormSection>
          )}

          {/* Dates début/fin et notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="Date de début" name="dateDebut" type="datetime-local" value={formData.dateDebut || ''} onChange={handleChange} />
            <FormInput label="Date de fin" name="dateFin" type="datetime-local" value={formData.dateFin || ''} onChange={handleChange} />
          </div>
          <FormTextarea label="Notes complémentaires" name="notesComplementaires" value={formData.notesComplementaires || ''} onChange={handleChange} rows={2} />
        </FormSection>

        <FormActions
          onCancel={() => router.back()}
          submitLabel="Enregistrer"
          loading={loading}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}