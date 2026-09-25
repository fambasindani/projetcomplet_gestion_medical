'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { examenService } from '@/app/services/examenService';
import { categorieExamenService } from '@/app/services/categorieExamenService';
import { acteCatalogueService, type GroupeActe } from '@/app/services/acteCatalogueService';
import ActeAutocomplete from '@/app/components/facturation/ActeAutocomplete';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { FormInput } from '../common/FormInput';
import { FormSelect } from '../common/FormSelect';
import { FormTextarea } from '../common/FormTextarea';
import { CategorieExamen, StatutExamen, ConfidentialiteExamen } from '@/app/types/examen';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';


interface ExamenLigne {
  typeExamen: string;
  idCategorieExamen: number;
  idGroupeCatalogue: number | null;
  idActeCatalogue: number | null;
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
  { value: 'En_cours', label: 'En cours' },
  { value: 'Réalisé', label: 'Réalisé' },
  { value: 'Validé', label: 'Validé' },
  { value: 'Annulé', label: 'Annulé' },
];

export default function NouveauBatchExamens() {
  const router = useRouter();
  const [categories, setCategories] = useState<CategorieExamen[]>([]);
  const [groupesCatalogue, setGroupesCatalogue] = useState<GroupeActe[]>([]);
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
    idGroupeCatalogue: null,
    idActeCatalogue: null,
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
    acteCatalogueService
      .getGroupesAdmin('Examen')
      .then((g) => setGroupesCatalogue(g.filter((x) => x.actif !== false)))
      .catch(console.error);
  }, []);

  // Un seul niveau : le groupe du catalogue (ex. « Agent pathogène »).
  // On résout automatiquement la catégorie d'examen liée à ce groupe, ou
  // « Autre » par défaut (le backend exige une catégorie non nulle).
  const categoriePourGroupe = (idGroupe: number): number => {
    const liee = categories.find((c) => c.idGroupeCatalogue === idGroupe);
    if (liee) return liee.idCategorieExamen;
    const autre = categories.find((c) => c.code === 'AUTRE');
    return autre?.idCategorieExamen ?? categories[0]?.idCategorieExamen ?? 0;
  };

  const handleGroupeChange = (idGroupe: number | null) => {
    setCurrentLigne((prev) => ({
      ...prev,
      idGroupeCatalogue: idGroupe,
      idCategorieExamen: idGroupe ? categoriePourGroupe(idGroupe) : 0,
      typeExamen: '',
      idActeCatalogue: null,
    }));
  };

  const handleCatalogueSelect = (acte: { libelle: string; idActeCatalogue: number }) => {
    setCurrentLigne((prev) => ({ ...prev, typeExamen: acte.libelle, idActeCatalogue: acte.idActeCatalogue }));
  };

  const addLigne = () => {
    if (!currentLigne.typeExamen || !currentLigne.idGroupeCatalogue || !currentLigne.idCategorieExamen) {
      toast.error('Groupe et examen précis requis pour chaque ligne');
      return;
    }
    setForm(prev => ({
      ...prev,
      examens: [...prev.examens, { ...currentLigne }],
    }));
    setCurrentLigne({
      typeExamen: '',
      idCategorieExamen: 0,
      idGroupeCatalogue: null,
      idActeCatalogue: null,
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
    <PageShell
      title="Prescription multiple d'examens"
      maxWidth="max-w-6xl"
      onBack={() => router.back()}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection>
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
              <FormSelect
                label="Groupe d'examens"
                value={currentLigne.idGroupeCatalogue ?? ''}
                onChange={(e) => handleGroupeChange(e.target.value ? Number(e.target.value) : null)}
                options={[
                  {
                    value: '',
                    label: groupesCatalogue.length === 0
                      ? 'Chargement des groupes...'
                      : '-- Choisir un groupe --',
                  },
                  ...groupesCatalogue.map((g) => ({ value: g.idGroupe, label: g.libelle })),
                ]}
                required
              />
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Examen précis
                </label>
                <ActeAutocomplete
                  categorie="Examen"
                  idGroupe={currentLigne.idGroupeCatalogue}
                  value={currentLigne.typeExamen}
                  onChange={(text) => setCurrentLigne((prev) => ({ ...prev, typeExamen: text, idActeCatalogue: null }))}
                  onSelect={handleCatalogueSelect}
                  disabled={!currentLigne.idGroupeCatalogue}
                  placeholder={
                    !currentLigne.idGroupeCatalogue
                      ? 'Choisissez d\'abord un groupe d\'examens'
                      : 'Tapez pour rechercher (ex. : radio, ECG, paludisme...)'
                  }
                />
              </div>
            </div>
            <div className="mt-3 flex justify-end">
              <button
                type="button"
                onClick={addLigne}
                className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center gap-1"
              >
                <FaPlus /> Ajouter
              </button>
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
              <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
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
                        { value: 'Très_confidentiel', label: 'Très confidentiel' },
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
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Type</th>
                      <th className="px-3 py-2 text-left">Groupe</th>
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
                        <td className="px-3 py-2">{groupesCatalogue.find(g => g.idGroupe === ex.idGroupeCatalogue)?.libelle || '-'}</td>
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

        </FormSection>

        <FormActions
          onCancel={() => router.back()}
          submitLabel={`Créer ${form.examens.length} examen(s)`}
          loading={loading}
          loadingLabel="Création..."
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}