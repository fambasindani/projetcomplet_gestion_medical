'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaPrint,
  FaPills,
  FaUser,
  FaClipboardList,
  FaCheckCircle,
} from 'react-icons/fa';
import { delivranceService } from '@/app/services/delivranceService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { MedecinSearchSelect } from '@/app/components/common/MedecinSearchSelect';
import { MedicamentSearchSelect } from '@/app/components/common/MedicamentSearchSelect';
import { LotSearchSelect } from '@/app/components/common/LotSearchSelect';
import { PrescriptionSearchSelect } from '@/app/components/common/PrescriptionSearchSelect';
import OrdonnanceModal from '../../prescriptions/OrdonnanceModal';
import { FormInput } from '../../common/FormInput';
import { FormSelect } from '../../common/FormSelect';
import { FormTextarea } from '../../common/FormTextarea';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import Button from '@/app/ui/Button';

type MotifDelivrance = 'SUR_ORDONNANCE' | 'URGENCE' | 'GRATUITE';

interface DetailDelivrance {
  idMedicament: number;
  idLot: number;
  quantiteDelivree: number;
  prixUnitaire: number;
  priseEnChargeMutuelle: number;
  // Champs d'affichage (non envoyés à l'API)
  nomMedicament?: string;
  numeroLot?: string;
}

const NouvelleDelivrance = () => {
  const router = useRouter();
  const [form, setForm] = useState({
    numeroOrdonnance: '',
    idPatient: 0,
    idMedecinPrescripteur: null as number | null,
    idPrescriptionMed: null as number | null,
    motifDelivrance: 'SUR_ORDONNANCE' as MotifDelivrance,
    observations: '',
    signatureElectronique: false,
    details: [] as DetailDelivrance[],
  });

  const [currentDetail, setCurrentDetail] = useState<DetailDelivrance>({
    idMedicament: 0,
    idLot: 0,
    quantiteDelivree: 1,
    prixUnitaire: 0,
    priseEnChargeMutuelle: 0,
    nomMedicament: '',
    numeroLot: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [patientError, setPatientError] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState<{ id: number; numero: string } | null>(null);
  const [showOrdonnanceModal, setShowOrdonnanceModal] = useState(false);

  const handlePatientChange = (id: number | null) => {
    setForm((prev) => ({ ...prev, idPatient: id || 0 }));
    if (id) setPatientError('');
  };

  const handleMedecinChange = (id: number | null) => {
    setForm((prev) => ({ ...prev, idMedecinPrescripteur: id }));
  };

  const handlePrescriptionChange = (id: number | null, numeroPrescription?: string) => {
    setForm((prev) => ({ ...prev, idPrescriptionMed: id }));
    if (id && numeroPrescription) {
      setSelectedPrescription({ id, numero: numeroPrescription });
    } else {
      setSelectedPrescription(null);
    }
  };

  const handlePrintOrdonnance = () => {
    if (selectedPrescription?.id) {
      setShowOrdonnanceModal(true);
    }
  };

  const handleMotifChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, motifDelivrance: e.target.value as MotifDelivrance }));
  };

  const handleMedicamentSelect = (id: number | null, nom?: string) => {
    setCurrentDetail((prev) => ({
      ...prev,
      idMedicament: id || 0,
      idLot: 0,
      nomMedicament: nom || '',
      numeroLot: '',
      prixUnitaire: 0,
    }));
    if (errors.medicament) setErrors((prev) => ({ ...prev, medicament: '' }));
  };

  const handleLotSelect = (
    lotId: number | null,
    numeroLot?: string,
    medicamentNom?: string,
    prixVenteUnitaire?: number
  ) => {
    if (lotId) {
      setCurrentDetail((prev) => ({
        ...prev,
        idLot: lotId,
        numeroLot: numeroLot || '',
        prixUnitaire: prixVenteUnitaire || 0,
      }));
      if (errors.lot) setErrors((prev) => ({ ...prev, lot: '' }));
    } else {
      setCurrentDetail((prev) => ({ ...prev, idLot: 0, numeroLot: '', prixUnitaire: 0 }));
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setCurrentDetail((prev) => ({ ...prev, quantiteDelivree: value > 0 ? value : 1 }));
    if (errors.quantite) setErrors((prev) => ({ ...prev, quantite: '' }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDetail((prev) => ({ ...prev, prixUnitaire: parseFloat(e.target.value) || 0 }));
    if (errors.prix) setErrors((prev) => ({ ...prev, prix: '' }));
  };

  const handleMutuelleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDetail((prev) => ({ ...prev, priseEnChargeMutuelle: parseFloat(e.target.value) || 0 }));
  };

  const addDetail = () => {
    const newErrors: { [key: string]: string } = {};
    if (!currentDetail.idMedicament || currentDetail.idMedicament <= 0)
      newErrors.medicament = 'Sélectionnez un médicament';
    if (!currentDetail.idLot || currentDetail.idLot <= 0) newErrors.lot = 'Sélectionnez un lot';
    if (currentDetail.quantiteDelivree <= 0) newErrors.quantite = 'Quantité > 0';
    if (currentDetail.prixUnitaire <= 0) newErrors.prix = 'Prix unitaire > 0';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error('Veuillez corriger les erreurs');
      return;
    }
    setErrors({});
    setForm((prev) => ({
      ...prev,
      details: [...prev.details, { ...currentDetail }],
    }));
    setCurrentDetail({
      idMedicament: 0,
      idLot: 0,
      quantiteDelivree: 1,
      prixUnitaire: 0,
      priseEnChargeMutuelle: 0,
      nomMedicament: '',
      numeroLot: '',
    });
  };

  const removeDetail = (idx: number) => {
    setForm((prev) => ({ ...prev, details: prev.details.filter((_, i) => i !== idx) }));
  };

  const validateForm = (): boolean => {
    let isValid = true;
    if (!form.idPatient) {
      setPatientError('Veuillez sélectionner un patient');
      isValid = false;
    } else {
      setPatientError('');
    }
    if (form.details.length === 0) {
      toast.error('Ajoutez au moins un médicament délivré');
      isValid = false;
    }
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      // On ne garde que les champs utiles pour l'API
      const payload = {
        ...form,
        idPrescriptionMed: form.idPrescriptionMed,
        details: form.details.map(({ idMedicament, idLot, quantiteDelivree, prixUnitaire, priseEnChargeMutuelle }) => ({
          idMedicament,
          idLot,
          quantiteDelivree,
          prixUnitaire,
          priseEnChargeMutuelle,
        })),
      };
      await delivranceService.create(payload);
      toast.success('Délivrance enregistrée');
      router.push('/pharmacie/delivrances');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const motifOptions = [
    { value: 'SUR_ORDONNANCE', label: 'Sur ordonnance' },
    { value: 'URGENCE', label: 'Urgence' },
    { value: 'GRATUITE', label: 'Gratuite' },
  ];

  return (
    <PageShell
      title="Nouvelle délivrance"
      onBack={() => router.back()}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Patient & Prescription */}
            <FormSection title="Patient et prescription" icon={<FaUser />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <PatientSearchSelect
                    value={form.idPatient}
                    onChange={handlePatientChange}
                    required
                    label="Patient"
                    error={patientError}
                  />
                </div>
                <div>
                  <MedecinSearchSelect
                    value={form.idMedecinPrescripteur}
                    onChange={handleMedecinChange}
                    label="Médecin prescripteur"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <PrescriptionSearchSelect
                    value={form.idPrescriptionMed}
                    onChange={handlePrescriptionChange}
                    label="Ordonnance associée"
                    placeholder="Sélectionner une ordonnance (facultatif)"
                    patientId={form.idPatient || undefined}
                  />
                  {selectedPrescription && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={handlePrintOrdonnance}
                        className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-green-200 transition"
                      >
                        <FaPrint size={14} /> Imprimer l&apos;ordonnance
                      </button>
                    </div>
                  )}
                </div>
                <FormInput
                  label="Numéro d'ordonnance (manuel)"
                  name="numeroOrdonnance"
                  value={form.numeroOrdonnance}
                  onChange={(e) => setForm((prev) => ({ ...prev, numeroOrdonnance: e.target.value }))}
                  placeholder="Facultatif"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormSelect
                  label="Motif de délivrance"
                  name="motifDelivrance"
                  value={form.motifDelivrance}
                  onChange={handleMotifChange}
                  options={motifOptions}
                  required
                />
                <div className="flex items-center mt-2">
                  <input
                    type="checkbox"
                    id="signature"
                    checked={form.signatureElectronique}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, signatureElectronique: e.target.checked }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="signature" className="ml-2 text-sm text-gray-700">
                    Signature électronique
                  </label>
                </div>
              </div>
              <FormTextarea
                label="Observations"
                name="observations"
                value={form.observations}
                onChange={(e) => setForm((prev) => ({ ...prev, observations: e.target.value }))}
                rows={2}
                placeholder="Informations complémentaires…"
              />
            </FormSection>

            {/* Section Médicaments délivrés */}
            <FormSection title="Médicaments délivrés" icon={<FaPills />}>
              {/* Ligne d'ajout */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-7 gap-3 items-end">
                  <div className="col-span-2">
                    <MedicamentSearchSelect
                      value={currentDetail.idMedicament || null}
                      onChange={handleMedicamentSelect}
                      placeholder="Sélectionner un médicament"
                      label="Médicament"
                      error={errors.medicament}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <LotSearchSelect
                      value={currentDetail.idLot || null}
                      onChange={handleLotSelect}
                      medicamentId={currentDetail.idMedicament || undefined}
                      label="Lot"
                      placeholder={currentDetail.idMedicament ? 'Sélectionner un lot' : "Choisissez d'abord un médicament"}
                      disabled={!currentDetail.idMedicament}
                      error={errors.lot}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Quantité <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Qté"
                      value={currentDetail.quantiteDelivree}
                      onChange={handleQuantityChange}
                      className={`w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                        errors.quantite ? 'border-red-500' : ''
                      }`}
                    />
                    {errors.quantite && (
                      <p className="mt-1 text-xs text-red-600">{errors.quantite}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">
                      Prix unitaire <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="Prix unit."
                      value={currentDetail.prixUnitaire}
                      onChange={handlePriceChange}
                      disabled
                      className="w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2.5 text-sm text-gray-500"
                    />
                    {errors.prix && <p className="mt-1 text-xs text-red-600">{errors.prix}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500">Mutuelle</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Mutuelle"
                      value={currentDetail.priseEnChargeMutuelle}
                      onChange={handleMutuelleChange}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      onClick={addDetail}
                      icon={<FaPlus size={12} />}
                      className="w-full h-[42px]"
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
                {form.details.length === 0 && (
                  <p className="text-sm text-red-600 mt-2">Au moins un médicament est requis</p>
                )}
              </div>

              {/* Tableau des médicaments ajoutés */}
              {form.details.length > 0 && (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Médicament</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Lot</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Qté</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Prix unit.</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Mutuelle</th>
                        <th className="px-4 py-2 text-left font-medium text-gray-500">Montant</th>
                        <th className="px-4 py-2 text-center font-medium text-gray-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {form.details.map((det, idx) => {
                        const montant = det.quantiteDelivree * det.prixUnitaire;
                        return (
                          <tr key={idx}>
                            <td className="px-4 py-2">{det.nomMedicament || det.idMedicament}</td>
                            <td className="px-4 py-2">{det.numeroLot || det.idLot}</td>
                            <td className="px-4 py-2">{det.quantiteDelivree}</td>
                            <td className="px-4 py-2">{det.prixUnitaire.toFixed(2)} $</td>
                            <td className="px-4 py-2">{det.priseEnChargeMutuelle.toFixed(2)} $</td>
                            <td className="px-4 py-2">{montant.toFixed(2)} $</td>
                            <td className="px-4 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => removeDetail(idx)}
                                className="text-red-500 hover:text-red-700 transition"
                              >
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </FormSection>
          </div>

          {/* Colonne latérale : résumé / info */}
          <div className="lg:col-span-1">
            <FormSection title="Récapitulatif" icon={<FaClipboardList />} className="sticky top-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Médicaments</span>
                <span className="font-medium">{form.details.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total (hors mutuelle)</span>
                <span className="font-medium">
                  {form.details
                    .reduce((acc, d) => acc + d.quantiteDelivree * d.prixUnitaire, 0)
                    .toFixed(2)}{' '}
                  $
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Prise en charge mutuelle</span>
                <span className="font-medium">
                  {form.details
                    .reduce((acc, d) => acc + d.priseEnChargeMutuelle, 0)
                    .toFixed(2)}{' '}
                  $
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Net à payer</span>
                <span>
                  {form.details
                    .reduce(
                      (acc, d) => acc + d.quantiteDelivree * d.prixUnitaire - d.priseEnChargeMutuelle,
                      0
                    )
                    .toFixed(2)}{' '}
                  $
                </span>
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
                <FaCheckCircle className="inline mr-1" /> Les champs marqués d&apos;une étoile (*) sont
                obligatoires.
              </div>
            </FormSection>
          </div>
        </div>

        {/* Boutons d'action */}
        <FormActions
          onCancel={() => router.back()}
          loading={loading}
          submitLabel="Enregistrer"
          submitIcon={<FaSave />}
        />
      </form>

      {showOrdonnanceModal && (
        <OrdonnanceModal
          isOpen={showOrdonnanceModal}
          prescriptionId={selectedPrescription?.id ?? null}
          onClose={() => setShowOrdonnanceModal(false)}
        />
      )}
    </PageShell>
  );
};

export default NouvelleDelivrance;
