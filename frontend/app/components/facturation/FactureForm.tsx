'use client';

import { useCallback, useEffect, useState } from 'react';
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
} from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { acteMedicalService } from '@/app/services/acteMedicalService';
import { factureService } from '@/app/services/factureService';
import type { FactureCreate } from '@/app/types/facture';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import Button, { IconButton } from '@/app/ui/Button';

interface LigneFacture {
  idActe: number | null;
  idMedicament: number | null;
  description: string;
  quantite: number;
  prixUnitaire: number;
  remise: number;
}

interface ActeOption {
  idActe: number;
  codeActe: string;
  libelle: string;
  prixBase: number;
}

const nouvelleLigne = (): LigneFacture => ({
  idActe: null,
  idMedicament: null,
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
  const [actes, setActes] = useState<ActeOption[]>([]);
  const [loading, setLoading] = useState(false);

  const [idPatient, setIdPatient] = useState<number | null>(null);
  const [tva, setTva] = useState(18);
  const [dateEcheance, setDateEcheance] = useState('');
  const [assurancePriseEnCharge, setAssurancePriseEnCharge] = useState(false);
  const [mutuellePriseEnCharge, setMutuellePriseEnCharge] = useState(false);
  const [montantMutuelle, setMontantMutuelle] = useState(0);
  const [mutuelleId, setMutuelleId] = useState('');
  const [notesComptables, setNotesComptables] = useState('');
  const [lignes, setLignes] = useState<LigneFacture[]>([nouvelleLigne()]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadActes = useCallback(async () => {
    try {
      const list = await acteMedicalService.getSimpleList();
      setActes(list);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    void (async () => { await loadActes(); })();
  }, [loadActes]);

  const handleActeChange = (index: number, acteId: number | null) => {
    setLignes((prev) => {
      const updated = [...prev];
      const acte = actes.find((a) => a.idActe === acteId);
      updated[index] = {
        ...updated[index],
        idActe: acteId,
        description: acte ? acte.libelle : updated[index].description,
        prixUnitaire: acte ? acte.prixBase : updated[index].prixUnitaire,
      };
      return updated;
    });
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
    return { totalHt, montantTva, totalTtc };
  };

  const { totalHt, montantTva, totalTtc } = calculs();

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
        idHospitalisation: null,
        dateEcheance: formatDateForBackend(dateEcheance),
        tva,
        assurancePriseEnCharge,
        mutuelleId: mutuellePriseEnCharge && mutuelleId ? String(mutuelleId) : null,
        mutuellePriseEnCharge: mutuellePriseEnCharge ? montantMutuelle : null,
        notesComptables: notesComptables || null,
        details: lignes.map((ligne) => ({
          idActe: ligne.idActe,
          idMedicament: ligne.idMedicament,
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
    <div className="mx-auto max-w-7xl space-y-6">
      <PageHeader
        title="Nouvelle facture"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/factures')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                <FaUserInjured /> Informations générales
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <PatientSearchSelect
                    value={idPatient}
                    onChange={setIdPatient}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={assurancePriseEnCharge}
                    onChange={(e) => setAssurancePriseEnCharge(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Assurance prise en charge
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={mutuellePriseEnCharge}
                    onChange={(e) => setMutuellePriseEnCharge(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Mutuelle prise en charge
                </label>
              </div>

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
                    label="Montant pris en charge (€)"
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
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2">
                <FaClipboardList /> Lignes de la facture
              </h5>

              {lignes.length === 0 && (
                <p className="text-sm text-gray-500">Aucune ligne. Ajoutez au moins une prestation.</p>
              )}

              <div className="space-y-4">
                {lignes.map((ligne, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Ligne {index + 1}</span>
                      <IconButton
                        color="red"
                        title="Supprimer la ligne"
                        onClick={() => removeLigne(index)}
                      >
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Acte médical</label>
                        <select
                          value={ligne.idActe ?? ''}
                          onChange={(e) =>
                            handleActeChange(index, e.target.value === '' ? null : Number(e.target.value))
                          }
                          className="block w-full rounded-lg border border-gray-300 p-2 text-sm"
                        >
                          <option value="">Aucun acte (saisie libre)</option>
                          {actes.map((acte) => (
                            <option key={acte.idActe} value={acte.idActe}>
                              {acte.codeActe} - {acte.libelle}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <FormInput
                          label="Description"
                          name={`description-${index}`}
                          value={ligne.description}
                          onChange={(e) => updateLigne(index, 'description', e.target.value)}
                          placeholder="Libellé de la prestation"
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

              <Button
                type="button"
                variant="secondary"
                icon={<FaPlus size={12} />}
                onClick={addLigne}
                className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
              >
                Ajouter une ligne
              </Button>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
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
                  <span className="font-medium">{totalHt.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">TVA ({tva.toFixed(2)}%)</span>
                  <span className="font-medium">{montantTva.toFixed(2)}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-sm font-semibold">
                  <span>Total TTC</span>
                  <span className="text-indigo-600">{totalTtc.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button variant="secondary" type="button" onClick={() => router.push('/factures')}>
            Annuler
          </Button>
          <Button type="submit" disabled={loading} icon={!loading ? <FaSave /> : undefined}>
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                En cours...
              </>
            ) : (
              'Créer la facture'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
