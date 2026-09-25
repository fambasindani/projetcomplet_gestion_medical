'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaSave,
  FaArrowLeft,
  FaPlus,
  FaTrash,
  FaFileInvoice,
  FaClipboardList,
  FaUserInjured,
  FaDownload,
  FaSpinner,
} from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import ActeAutocomplete from '@/app/components/facturation/ActeAutocomplete';
import { useAuth } from '@/app/contexts/AuthContext';
import { consultationService } from '@/app/services/consultationService';
import { hospitalisationService } from '@/app/services/hospitalisationService';
import { factureService, SourceElementLabels, type ElementFacturable, type SourceElement } from '@/app/services/factureService';
import type { FactureCreate } from '@/app/types/facture';
import type { Consultation } from '@/app/types/consultation';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import Button, { IconButton } from '@/app/ui/Button';

interface LigneFacture {
  idActe: number | null;
  idActeCatalogue: number | null;
  idMedicament: number | null;
  source: string | null;
  idSource: number | null;
  description: string;
  quantite: number;
  prixUnitaire: number;
  remise: number;
}

const nouvelleLigne = (): LigneFacture => ({
  idActe: null,
  idActeCatalogue: null,
  idMedicament: null,
  source: null,
  idSource: null,
  description: '',
  quantite: 1,
  prixUnitaire: 0,
  remise: 0,
});

const formatDateForBackend = (dateStr: string): string | null => {
  if (!dateStr) return null;
  const localDate = new Date(dateStr);
  if (isNaN(localDate.getTime())) return null;
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}T00:00:00`;
};

export default function FactureForm() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  // Règle internationale : par défaut, on ne facture que les prestations
  // réalisées et tracées (issues du dossier patient). L'ajout manuel d'un acte
  // est réservé aux profils disposant de FACTURATION_GERER.
  const peutAjouterActe = hasPermission('FACTURATION_GERER');
  const [loading, setLoading] = useState(false);

  const [idPatient, setIdPatient] = useState<number | null>(null);
  const [tva, setTva] = useState(18);
  const [dateEcheance, setDateEcheance] = useState('');
  const [assurancePriseEnCharge, setAssurancePriseEnCharge] = useState(false);
  const [tauxAssurance, setTauxAssurance] = useState(0);
  const [mutuellePriseEnCharge, setMutuellePriseEnCharge] = useState(false);
  const [montantMutuelle, setMontantMutuelle] = useState(0);
  const [mutuelleId, setMutuelleId] = useState('');
  const [notesComptables, setNotesComptables] = useState('');
  const [lignes, setLignes] = useState<LigneFacture[]>(peutAjouterActe ? [nouvelleLigne()] : []);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [elementsPatient, setElementsPatient] = useState<ElementFacturable[]>([]);
  const [elementsCharges, setElementsCharges] = useState(false);
  const [chargementElements, setChargementElements] = useState(false);
  const [selectionElements, setSelectionElements] = useState<Set<number>>(new Set());
  const [consultationsPatient, setConsultationsPatient] = useState<Consultation[]>([]);
  const [idConsultation, setIdConsultation] = useState<number | ''>('');
  const [chargementConsultations, setChargementConsultations] = useState(false);
  const [hospitalisationsPatient, setHospitalisationsPatient] = useState<{ idHospitalisation: number; numeroAdmission?: string; chambreNumero?: string; statut?: string }[]>([]);
  const [idHospitalisation, setIdHospitalisation] = useState<number | ''>('');

  const handleCatalogueSelect = (index: number, acte: { idActeCatalogue: number; libelle: string; prixDefaut: number }) => {
    setLignes((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        idActeCatalogue: acte.idActeCatalogue,
        description: acte.libelle,
        prixUnitaire: acte.prixDefaut,
      };
      return updated;
    });
  };

  const chargerConsultationsPatient = async (patientId: number) => {
    setChargementConsultations(true);
    try {
      const resultat = await consultationService.getByPatient(patientId, 1, 200);
      setConsultationsPatient(resultat.items ?? []);
    } catch {
      setConsultationsPatient([]);
    } finally {
      setChargementConsultations(false);
    }
  };

  const chargerHospitalisationsPatient = async (patientId: number) => {
    try {
      const resultat = await hospitalisationService.search({ idPatient: patientId }, 1, 100);
      setHospitalisationsPatient(
        (resultat.items ?? []).map((h) => ({
          idHospitalisation: h.idHospitalisation,
          numeroAdmission: h.numeroAdmission ?? undefined,
          chambreNumero: h.chambreNumero ?? undefined,
          statut: h.statut,
        }))
      );
    } catch {
      setHospitalisationsPatient([]);
    }
  };

  const handlePatientChange = (value: number | null) => {
    setIdPatient(value);
    setElementsPatient([]);
    setElementsCharges(false);
    setSelectionElements(new Set());
    setIdConsultation('');
    setIdHospitalisation('');
    if (value) {
      void chargerConsultationsPatient(value);
      void chargerHospitalisationsPatient(value);
    } else {
      setConsultationsPatient([]);
      setHospitalisationsPatient([]);
    }
  };

  const chargerElementsPatient = async () => {
    if (!idPatient) {
      toast.error('Sélectionnez d\'abord un patient');
      return;
    }
    setChargementElements(true);
    try {
      // Facturation par période (modèle séjour / journée) : on ne récupère que
      // les prestations comprises entre les dates choisies. Si aucune période
      // n'est renseignée, tout l'historique du patient est proposé.
      const elements = await factureService.getElementsPatient(
        idPatient,
        null,
        null,
        dateDebut || null,
        dateFin || null
      );
      setElementsPatient(elements);
      setElementsCharges(true);
      setSelectionElements(new Set(elements.map((_, i) => i)));
      if (elements.length === 0) {
        toast('Aucun élément facturable trouvé pour ce patient');
      } else {
        toast.success(`${elements.length} élément(s) récupéré(s) pour ce patient`);
      }
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setChargementElements(false);
    }
  };

  const toggleElement = (index: number) => {
    setSelectionElements((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const ajouterElementsSelectionnes = () => {
    const elementsAjoutes = elementsPatient
      .map((el, index) => ({ el, index }))
      .filter(({ index }) => selectionElements.has(index));
    if (elementsAjoutes.length === 0) {
      toast.error('Cochez au moins un élément à ajouter');
      return;
    }
    setLignes((prev) => {
      const nouvelles: LigneFacture[] = elementsAjoutes.map(({ el }) => ({
        idActe: el.idActe,
        idActeCatalogue: el.idActeCatalogue ?? null,
        idMedicament: el.idMedicament,
        source: el.source,
        idSource: el.idSource,
        description: el.description,
        quantite: el.quantite > 0 ? el.quantite : 1,
        prixUnitaire: el.prixUnitaire,
        remise: 0,
      }));
      return [...prev.filter((l) => !(l.description.trim() === '' && l.quantite === 1 && l.prixUnitaire === 0)), ...nouvelles];
    });
    toast.success(`${elementsAjoutes.length} élément(s) ajouté(s) à la facture`);
    setElementsCharges(false);
    setElementsPatient([]);
    setSelectionElements(new Set());
  };

  const updateLigne = (index: number, field: 'description' | 'quantite' | 'prixUnitaire' | 'remise', value: string | number) => {
    setLignes((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addLigne = () => {
    setLignes((prev) => [...prev, nouvelleLigne()]);
  };

  const removeLigne = (index: number) => {
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const calculs = () => {
    let totalHt = 0;
    lignes.forEach((ligne) => {
      const montant = (ligne.prixUnitaire || 0) * (ligne.quantite || 0);
      totalHt += montant * (1 - (ligne.remise || 0) / 100);
    });
    const montantTva = totalHt * (tva / 100);
    const totalTtc = totalHt + montantTva;
    // Ventilation tiers payant (France / Belgique / Chine)
    const partAssurance = assurancePriseEnCharge ? totalTtc * (tauxAssurance / 100) : 0;
    const partComplementaire = mutuellePriseEnCharge ? montantMutuelle : 0;
    const couverture = Math.min(partAssurance + partComplementaire, totalTtc);
    const reste = Math.max(totalTtc - couverture, 0);
    return { totalHt, montantTva, totalTtc, partAssurance, partComplementaire, reste };
  };

  const { totalHt, montantTva, totalTtc, partAssurance, partComplementaire, reste } = calculs();

  const ORDRE_SOURCES: SourceElement[] = ['CONSULTATION', 'EXAMEN', 'MEDICAMENT', 'HOSPITALISATION', 'SOIN', 'INTERVENTION'];

  const groupesElements = useMemo(() => {
    const map = new Map<SourceElement, { el: ElementFacturable; index: number }[]>();
    elementsPatient.forEach((el, index) => {
      const arr = map.get(el.source) ?? [];
      arr.push({ el, index });
      map.set(el.source, arr);
    });
    return ORDRE_SOURCES.filter((s) => map.has(s)).map((s) => ({ source: s, items: map.get(s)! }));
  }, [elementsPatient]);

  const totalSelectionne = useMemo(
    () => elementsPatient.reduce((acc, el, i) => (selectionElements.has(i) ? acc + el.prixUnitaire * el.quantite : acc), 0),
    [elementsPatient, selectionElements]
  );

  const toggleGroup = (indices: number[], checked: boolean) => {
    setSelectionElements((prev) => {
      const next = new Set(prev);
      indices.forEach((i) => (checked ? next.add(i) : next.delete(i)));
      return next;
    });
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!idPatient) {
      err.idPatient = 'Le patient est requis';
    }
    if (lignes.length === 0) {
      err.lignes = 'Ajoutez au moins une ligne';
    } else {
      const valides = lignes.filter((l) => l.description.trim() && l.quantite > 0 && l.prixUnitaire >= 0);
      if (valides.length !== lignes.length) {
        err.lignes = 'Chaque ligne doit avoir une description, une quantité positive et un prix valide';
      }
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!idPatient) return;
    setLoading(true);
    try {
      const payload: FactureCreate = {
        idPatient,
        idHospitalisation: idHospitalisation === '' ? null : idHospitalisation,
        idConsultation: idConsultation === '' ? null : idConsultation,
        dateEcheance: formatDateForBackend(dateEcheance),
        tva,
        assurancePriseEnCharge,
        tauxAssurance: assurancePriseEnCharge ? tauxAssurance : null,
        mutuelleId: mutuellePriseEnCharge && mutuelleId ? String(mutuelleId) : null,
        mutuellePriseEnCharge: mutuellePriseEnCharge ? montantMutuelle : null,
        notesComptables: notesComptables || null,
        details: lignes.map((ligne) => ({
          idActe: ligne.idActe,
          idActeCatalogue: ligne.idActeCatalogue,
          idMedicament: ligne.idMedicament,
          source: ligne.source,
          idSource: ligne.idSource,
          description: ligne.description || null,
          quantite: ligne.quantite,
          prixUnitaire: ligne.prixUnitaire,
          remise: ligne.remise,
        })),
      };
      const created = await factureService.create(payload);
      toast.success('Facture créée');
      router.push(`/factures/${created.idFacture}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Nouvelle facture"
      maxWidth="max-w-6xl"
      onBack={() => router.push('/factures')}
    >
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FormSection title="Informations générales" icon={<FaUserInjured />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <PatientSearchSelect
                    value={idPatient}
                    onChange={handlePatientChange}
                    error={errors.idPatient}
                    required
                    label="Patient"
                  />
                </div>
                <FormInput
                  label="TVA (%)"
                  name="tva"
                  type="number"
                  step="0.01"
                  min={0}
                  value={tva}
                  onChange={(e) => setTva(parseFloat(e.target.value) || 0)}
                />
                <FormInput
                  label="Date d'échéance"
                  name="dateEcheance"
                  type="date"
                  value={dateEcheance}
                  onChange={(e) => setDateEcheance(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Consultation liée</label>
                <select
                  value={idConsultation}
                  onChange={(e) => {
                    setIdConsultation(e.target.value === '' ? '' : Number(e.target.value));
                    setElementsPatient([]);
                    setElementsCharges(false);
                    setSelectionElements(new Set());
                  }}
                  className="block w-full rounded-lg border border-gray-300 p-2 text-sm disabled:bg-gray-100"
                  disabled={!idPatient || chargementConsultations}
                >
                  <option value="">
                    {chargementConsultations
                      ? 'Chargement des consultations...'
                      : idPatient
                        ? 'Aucune consultation spécifique (tout l\'historique)'
                        : 'Sélectionnez d\'abord un patient'}
                  </option>
                  {consultationsPatient.map((c) => (
                    <option key={c.idConsultation} value={c.idConsultation}>
                      Consultation du {new Date(c.dateConsultation).toLocaleDateString('fr-FR')}
                      {c.motifConsultation ? ` - ${c.motifConsultation}` : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Renseigne la consultation à laquelle la facture se rattache. La liste des éléments reste celle de <strong>tout l&apos;historique du patient</strong> ; cochez uniquement les prestations à facturer.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospitalisation liée (chambre)</label>
                <select
                  value={idHospitalisation}
                  onChange={(e) => {
                    setIdHospitalisation(e.target.value === '' ? '' : Number(e.target.value));
                    setElementsPatient([]);
                    setElementsCharges(false);
                    setSelectionElements(new Set());
                  }}
                  className="block w-full rounded-lg border border-gray-300 p-2 text-sm disabled:bg-gray-100"
                  disabled={!idPatient}
                >
                  <option value="">
                    {idPatient ? 'Aucune hospitalisation liée' : 'Sélectionnez d\'abord un patient'}
                  </option>
                  {hospitalisationsPatient.map((h) => (
                    <option key={h.idHospitalisation} value={h.idHospitalisation}>
                      #{h.idHospitalisation} {h.numeroAdmission ? `- ${h.numeroAdmission}` : ''}
                      {h.chambreNumero ? ` - Chambre ${h.chambreNumero}` : ' - sans chambre'}
                      {h.statut ? ` (${h.statut})` : ''}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Associe la facture à une hospitalisation : les frais de chambre/ séjour sont calculés automatiquement (nombre de jours × prix/jour).
                </p>
              </div>

              <div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormInput
                    label="Période — du"
                    name="dateDebut"
                    type="date"
                    value={dateDebut}
                    onChange={(e) => setDateDebut(e.target.value)}
                  />
                  <FormInput
                    label="Période — au"
                    name="dateFin"
                    type="date"
                    value={dateFin}
                    onChange={(e) => setDateFin(e.target.value)}
                  />
                  <div className="flex items-end">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const today = new Date().toISOString().slice(0, 10);
                          setDateDebut(today);
                          setDateFin(today);
                        }}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Aujourd&apos;hui
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const now = new Date();
                          const first = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
                          const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
                          setDateDebut(first);
                          setDateFin(last);
                        }}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Ce mois
                      </button>
                      <button
                        type="button"
                        onClick={() => { setDateDebut(''); setDateFin(''); }}
                        className="text-xs text-gray-500 hover:underline"
                      >
                        Effacer
                      </button>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={!idPatient || chargementElements}
                  onClick={chargerElementsPatient}
                  icon={chargementElements ? <FaSpinner className="animate-spin" /> : <FaDownload size={14} />}
                  className="mt-2"
                >
                  {chargementElements ? 'Chargement...' : 'Récupérer les éléments du patient'}
                </Button>
                <p className="mt-2 text-xs text-gray-500">
                  Ne remonte que les prestations <strong>réalisées et non encore facturées</strong> de la période
                  choisie : consultations, examens validés, médicaments délivrés, hospitalisations, soins et
                  interventions. Sans période, tout l&apos;historique est proposé.
                </p>
              </div>

              {elementsCharges && elementsPatient.length > 0 && (
                <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h6 className="text-sm font-semibold text-indigo-700">
                      {elementsPatient.length} élément(s) à facturer
                    </h6>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-indigo-700">
                        Sélection : {totalSelectionne.toFixed(2)} $
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectionElements(new Set(elementsPatient.map((_, i) => i)))}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Tout cocher
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectionElements(new Set())}
                        className="text-xs text-indigo-600 hover:underline"
                      >
                        Tout décocher
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 space-y-5 overflow-y-auto">
                    {groupesElements.map(({ source, items }) => {
                      const indices = items.map((i) => i.index);
                      const tousCoches = indices.every((i) => selectionElements.has(i));
                      const sousTotal = items.reduce((a, { el }) => a + el.prixUnitaire * el.quantite, 0);
                      return (
                        <div key={source}>
                          <div className="mb-2 flex items-center justify-between border-b border-indigo-100 pb-1">
                            <span className="text-xs font-bold uppercase tracking-wide text-indigo-600">
                              {SourceElementLabels[source]} ({items.length})
                            </span>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-gray-600">Sous-total : {sousTotal.toFixed(2)} $</span>
                              <button
                                type="button"
                                onClick={() => toggleGroup(indices, !tousCoches)}
                                className="text-xs text-indigo-600 hover:underline"
                              >
                                {tousCoches ? 'Décocher tout' : 'Cocher tout'}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {items.map(({ el, index }) => (
                              <label
                                key={index}
                                className="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-200 cursor-pointer hover:ring-indigo-200"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectionElements.has(index)}
                                  onChange={() => toggleElement(index)}
                                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600">
                                      {SourceElementLabels[el.source]}
                                    </span>
                                    <span className="text-xs text-gray-500">
                                      {el.dateElement ? new Date(el.dateElement).toLocaleDateString('fr-FR') : ''}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-700 truncate">{el.description}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-semibold text-gray-800">
                                    {(el.prixUnitaire * el.quantite).toFixed(2)} $
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {el.quantite} × {el.prixUnitaire.toFixed(2)} $
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <Button type="button" onClick={ajouterElementsSelectionnes} icon={<FaPlus size={12} />}>
                    Ajouter la sélection à la facture
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={assurancePriseEnCharge}
                    onChange={(e) => setAssurancePriseEnCharge(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Régime obligatoire (Assurance Maladie / INAMI)
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={mutuellePriseEnCharge}
                    onChange={(e) => setMutuellePriseEnCharge(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Complémentaire (mutuelle)
                </label>
              </div>

              {assurancePriseEnCharge && (
                <FormInput
                  label="Taux de couverture du régime obligatoire (%)"
                  name="tauxAssurance"
                  type="number"
                  step="0.01"
                  min={0}
                  max={100}
                  value={tauxAssurance}
                  onChange={(e) => setTauxAssurance(parseFloat(e.target.value) || 0)}
                  placeholder="ex. 70 (France) ou 75 (Belgique)"
                />
              )}

              {mutuellePriseEnCharge && (
                <>
                  <FormInput
                    label="N° mutuelle"
                    name="mutuelleId"
                    type="text"
                    value={mutuelleId}
                    onChange={(e) => setMutuelleId(e.target.value)}
                    placeholder="Identifiant de la mutuelle"
                  />
                  <FormInput
                    label="Montant pris en charge ($)"
                    name="montantMutuelle"
                    type="number"
                    step="0.01"
                    min={0}
                    value={montantMutuelle}
                    onChange={(e) => setMontantMutuelle(parseFloat(e.target.value) || 0)}
                  />
                </>
              )}

              <FormTextarea
                label="Notes comptables"
                name="notesComptables"
                value={notesComptables}
                onChange={(e) => setNotesComptables(e.target.value)}
                rows={3}
                placeholder="Informations comptables complémentaires..."
              />
            </FormSection>

            <FormSection title="Lignes de la facture" icon={<FaClipboardList />}>

              {!peutAjouterActe && (
                <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Seules les prestations <strong>réalisées et tracées</strong> du dossier patient
                  (consultations, examens validés, soins, médicaments délivrés, hospitalisations,
                  interventions terminées) peuvent être facturées. Utilisez
                  « Récupérer les éléments du patient » puis cochez les lignes.
                </div>
              )}

              {lignes.length === 0 && (
                <p className="text-sm text-gray-500">Aucune ligne. Ajoutez au moins une prestation.</p>
              )}

              <div className="space-y-4">
                {lignes.map((ligne, index) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-semibold text-gray-600">
                        Ligne {index + 1}
                        {ligne.source && SourceElementLabels[ligne.source as SourceElement] && (
                          <span className="rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-600">
                            {SourceElementLabels[ligne.source as SourceElement]}
                          </span>
                        )}
                      </span>
                      <IconButton
                        color="red"
                        title="Supprimer la ligne"
                        onClick={() => removeLigne(index)}
                      >
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {peutAjouterActe && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Acte du catalogue (ajout manuel)
                          </label>
                          <ActeAutocomplete
                            categorie=""
                            value={ligne.description}
                            onChange={(text) =>
                              updateLigne(index, 'description', text)
                            }
                            onSelect={(acte) => handleCatalogueSelect(index, {
                              idActeCatalogue: acte.idActeCatalogue,
                              libelle: acte.libelle,
                              prixDefaut: acte.prixDefaut,
                            })}
                            onClear={() => setLignes((prev) => {
                              const updated = [...prev];
                              updated[index] = { ...updated[index], idActeCatalogue: null };
                              return updated;
                            })}
                            placeholder="Rechercher dans le catalogue (ex. : paludisme, ECG...)"
                          />
                        </div>
                      )}
                      <div className={peutAjouterActe ? '' : 'md:col-span-2'}>
                        <FormInput
                          label="Description"
                          name={`description-${index}`}
                          value={ligne.description}
                          onChange={(e) => updateLigne(index, 'description', e.target.value)}
                          placeholder="Libellé de la prestation"
                          disabled={!peutAjouterActe}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <FormInput
                        type="number"
                        min={0}
                        label="Quantité"
                        name={`quantite-${index}`}
                        value={ligne.quantite}
                        onChange={(e) => updateLigne(index, 'quantite', parseInt(e.target.value) || 0)}
                      />
                      <FormInput
                        type="number"
                        min={0}
                        step="0.01"
                        label="Prix unitaire"
                        name={`prixUnitaire-${index}`}
                        value={ligne.prixUnitaire}
                        onChange={(e) => updateLigne(index, 'prixUnitaire', parseFloat(e.target.value) || 0)}
                      />
                      <FormInput
                        type="number"
                        min={0}
                        step="0.1"
                        label="Remise (%)"
                        name={`remise-${index}`}
                        value={ligne.remise}
                        onChange={(e) => updateLigne(index, 'remise', parseFloat(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {errors.lignes && <p className="text-sm text-red-600">{errors.lignes}</p>}

              {peutAjouterActe && (
                <Button
                  type="button"
                  variant="secondary"
                  icon={<FaPlus size={12} />}
                  onClick={addLigne}
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                >
                  Ajouter une ligne
                </Button>
              )}
            </FormSection>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden sticky top-6">
              <div className="bg-slate-50 px-6 py-3 border-b">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FaFileInvoice /> Récapitulatif
                </h5>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Prestations</span>
                  <span className="font-medium">{lignes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total HT</span>
                  <span className="font-medium">{totalHt.toFixed(2)} $</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA ({tva.toFixed(2)}%)</span>
                  <span className="font-medium">{montantTva.toFixed(2)} $</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total TTC</span>
                  <span className="text-indigo-600">{totalTtc.toFixed(2)} $</span>
                </div>

                {(assurancePriseEnCharge || mutuellePriseEnCharge) && (
                  <>
                    <hr className="my-2" />
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Ventilation tiers payant
                    </p>
                    {assurancePriseEnCharge && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Régime obligatoire ({tauxAssurance}%)</span>
                        <span className="font-medium text-emerald-600">- {partAssurance.toFixed(2)} $</span>
                      </div>
                    )}
                    {mutuellePriseEnCharge && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Complémentaire</span>
                        <span className="font-medium text-emerald-600">- {partComplementaire.toFixed(2)} $</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm font-semibold">
                      <span>Reste à charge patient</span>
                      <span className="text-rose-600">{reste.toFixed(2)} $</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <FormActions
            onCancel={() => router.push('/factures')}
            submitLabel="Créer la facture"
            loading={loading}
            loadingLabel="En cours..."
            submitIcon={<FaSave />}
          />
        </div>
      </form>
    </PageShell>
  );
}
