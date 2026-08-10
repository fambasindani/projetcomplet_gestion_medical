'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { examenService } from '@/app/services/examenService';
import { categorieExamenService } from '@/app/services/categorieExamenService';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';
import { CategorieExamen, StatutExamen, ConfidentialiteExamen } from '@/app/types/examen';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';


interface ExamenLigne {
  typeExamen: string;
  idCategorieExamen: number;
  datePlanification: string;
  dateRealisation: string;
  laboratoire: string;
  technicien: string;
  resultat: string;
  interpretation: string;
  compteRendu: string;
  anomalies: string;
  conclusion: string;
  statut: StatutExamen;
  confidentialite: ConfidentialiteExamen;
}

const statutOptions = [
  { value: 'Prescrit', label: 'Prescrit' },
  { value: 'Planifié', label: 'Planifié' },
  { value: 'Réalisé', label: 'Réalisé' },
  { value: 'Validé', label: 'Validé' },
  { value: 'Annulé', label: 'Annulé' },
];

export default function NouveauBatchExamens() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategorieExamen[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResultFields, setShowResultFields] = useState(false);
  const [form, setForm] = useState({
    idPatient: 0,
    idMedecinPrescripteur: 0,
    idPrescription: null as number | null,
    examens: [] as ExamenLigne[],
  });

  const [currentLigne, setCurrentLigne] = useState<ExamenLigne>({
    typeExamen: '',
    idCategorieExamen: 0,
    datePlanification: '',
    dateRealisation: '',
    laboratoire: '',
    technicien: '',
    resultat: '',
    interpretation: '',
    compteRendu: '',
    anomalies: '',
    conclusion: '',
    statut: 'Prescrit',
    confidentialite: 'Normal',
  });

  useEffect(() => {
    categorieExamenService.getAllList().then(setCategories).catch(console.error);
  }, []);

  const addLigne = () => {
    if (!currentLigne.typeExamen || !currentLigne.idCategorieExamen) {
      toast.error('Type et catégorie requis pour chaque examen');
      return;
    }
    setForm(prev => ({
      ...prev,
      examens: [...prev.examens, { ...currentLigne }],
    }));
    setCurrentLigne({
      typeExamen: '',
      idCategorieExamen: 0,
      datePlanification: '',
      dateRealisation: '',
      laboratoire: '',
      technicien: '',
      resultat: '',
      interpretation: '',
      compteRendu: '',
      anomalies: '',
      conclusion: '',
      statut: 'Prescrit',
      confidentialite: 'Normal',
    });
  };

  const removeLigne = (idx: number) => {
    setForm(prev => ({
      ...prev,
      examens: prev.examens.filter((_, i) => i !== idx),
    }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!form.idPatient || !form.idMedecinPrescripteur) {
    toast.error('Patient et médecin requis');
    return;
  }
  if (form.examens.length === 0) {
    toast.error('Ajoutez au moins un examen');
    return;
  }
  setLoading(true);
  try {
    const payload = {
      idPrescription: form.idPrescription,
      examens: form.examens.map(ex => ({
        ...ex,
        idPatient: form.idPatient,
        idMedecinPrescripteur: form.idMedecinPrescripteur,
        datePrescription: new Date().toISOString(),
      })),
    };
    await examenService.createBatch(payload);
    toast.success(`${form.examens.length} examen(s) créé(s)`);
    router.push('/examens/liste');
  } catch (err) {
    console.error('Erreur complète:', err);
    toast.error(extractErrorMessage(err));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 mb-6">
          <FaArrowLeft /> Retour
        </button>
        <h1 className="text-2xl font-bold mb-6">Prescription multiple d&apos;examens</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-6">
          {/* Infos communes */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PatientSearchSelect
              value={form.idPatient}
              onChange={(id) => setForm({...form, idPatient: id || 0})}
              required
            />
            <MedecinSearchSelect
              value={form.idMedecinPrescripteur}
              onChange={(id) => setForm({...form, idMedecinPrescripteur: id || 0})}
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Prescription (facultatif)</label>
              <input
                type="number"
                value={form.idPrescription ?? ''}
                onChange={e => setForm({...form, idPrescription: e.target.value ? parseInt(e.target.value) : null})}
                className="w-full border rounded p-2"
                placeholder="Si lié à une prescription"
              />
            </div>
          </div>

          {/* Ligne d'ajout */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Ajouter un examen</h3>
              <button
                type="button"
                onClick={() => setShowResultFields(!showResultFields)}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                {showResultFields ? <FaChevronUp /> : <FaChevronDown />}
                {showResultFields ? 'Masquer les résultats' : 'Ajouter les résultats'}
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
              <FormInput
                label="Type d'examen *"
                value={currentLigne.typeExamen}
                onChange={e => setCurrentLigne({...currentLigne, typeExamen: e.target.value})}
                required
              />
              <FormSelect
                label="Catégorie *"
                value={currentLigne.idCategorieExamen}
                onChange={e => setCurrentLigne({...currentLigne, idCategorieExamen: parseInt(e.target.value)})}
                options={categories.map((c) => ({ value: c.idCategorieExamen, label: c.libelle }))}
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={addLigne}
                  className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <FaPlus /> Ajouter
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-2">
              <FormInput
                label="Date planification"
                type="datetime-local"
                value={currentLigne.datePlanification}
                onChange={e => setCurrentLigne({...currentLigne, datePlanification: e.target.value})}
              />
              <FormInput
                label="Date réalisation"
                type="datetime-local"
                value={currentLigne.dateRealisation}
                onChange={e => setCurrentLigne({...currentLigne, dateRealisation: e.target.value})}
              />
              <FormInput
                label="Laboratoire"
                value={currentLigne.laboratoire}
                onChange={e => setCurrentLigne({...currentLigne, laboratoire: e.target.value})}
              />
              <FormInput
                label="Technicien"
                value={currentLigne.technicien}
                onChange={e => setCurrentLigne({...currentLigne, technicien: e.target.value})}
              />
            </div>

            {/* Champs de résultats (affichés si showResultFields est true) */}
            {showResultFields && (
              <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Résultats et interprétation</h4>
                <div className="grid grid-cols-1 gap-3">
                  <FormTextarea
                    label="Résultat"
                    value={currentLigne.resultat}
                    onChange={e => setCurrentLigne({...currentLigne, resultat: e.target.value})}
                    rows={2}
                    placeholder="Résultat de l'examen"
                  />
                  <FormTextarea
                    label="Interprétation"
                    value={currentLigne.interpretation}
                    onChange={e => setCurrentLigne({...currentLigne, interpretation: e.target.value})}
                    rows={2}
                    placeholder="Interprétation médicale"
                  />
                  <FormTextarea
                    label="Compte rendu"
                    value={currentLigne.compteRendu}
                    onChange={e => setCurrentLigne({...currentLigne, compteRendu: e.target.value})}
                    rows={2}
                    placeholder="Compte rendu complet"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormTextarea
                      label="Anomalies"
                      value={currentLigne.anomalies}
                      onChange={e => setCurrentLigne({...currentLigne, anomalies: e.target.value})}
                      rows={2}
                      placeholder="Anomalies constatées"
                    />
                    <FormTextarea
                      label="Conclusion"
                      value={currentLigne.conclusion}
                      onChange={e => setCurrentLigne({...currentLigne, conclusion: e.target.value})}
                      rows={2}
                      placeholder="Conclusion médicale"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FormSelect
                      label="Statut"
                      value={currentLigne.statut}
                      onChange={e => setCurrentLigne({...currentLigne, statut: e.target.value as StatutExamen})}
                      options={statutOptions}
                    />
                    <FormSelect
                      label="Confidentialité"
                      value={currentLigne.confidentialite}
                      onChange={e => setCurrentLigne({...currentLigne, confidentialite: e.target.value as ConfidentialiteExamen})}
                      options={[
                        { value: 'Normal', label: 'Normal' },
                        { value: 'Confidentiel', label: 'Confidentiel' },
                        { value: 'Très confidentiel', label: 'Très confidentiel' },
                      ]}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Liste des examens ajoutés */}
          {form.examens.length > 0 && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Examens à créer ({form.examens.length})</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Catégorie</th>
                      <th className="px-3 py-2 text-left">Laboratoire</th>
                      <th className="px-3 py-2 text-left">Technicien</th>
                      <th className="px-3 py-2 text-left">Statut</th>
                      <th className="px-3 py-2 text-left">Résultat</th>
                      <th className="px-3 py-2 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {form.examens.map((ex, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-3 py-2">{ex.typeExamen}</td>
                        <td className="px-3 py-2">{categories.find(c => c.idCategorieExamen === ex.idCategorieExamen)?.libelle || ex.idCategorieExamen}</td>
                        <td className="px-3 py-2">{ex.laboratoire || '-'}</td>
                        <td className="px-3 py-2">{ex.technicien || '-'}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${ex.statut === 'Prescrit' ? 'bg-yellow-100 text-yellow-800' : 
                            ex.statut === 'Planifié' ? 'bg-blue-100 text-blue-800' :
                            ex.statut === 'Réalisé' ? 'bg-green-100 text-green-800' :
                            ex.statut === 'Validé' ? 'bg-indigo-100 text-indigo-800' :
                            'bg-red-100 text-red-800'}`}>
                            {ex.statut}
                          </span>
                        </td>
                        <td className="px-3 py-2 max-w-xs truncate">{ex.resultat || '-'}</td>
                        <td className="px-3 py-2 text-center">
                          <button type="button" onClick={() => removeLigne(idx)} className="text-red-500 hover:text-red-700">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={() => router.back()} className="border px-4 py-2 rounded">Annuler</button>
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-2">
              <FaSave /> {loading ? 'Création...' : `Créer ${form.examens.length} examen(s)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}