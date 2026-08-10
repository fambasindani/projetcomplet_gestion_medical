'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaPills, FaFlask, FaClipboardList, FaEuroSign, FaBoxes } from 'react-icons/fa';
import { FormInput } from '../../common/FormInput';
import { FormSelect } from '../../common/FormSelect';
import { FormTextarea } from '../../common/FormTextarea';
import { CategorieSelect } from '../../common/CategorieSelect';
import { medicamentService } from '@/app/services/medicamentService';
import { MedicamentCreate } from '@/app/types/medicament';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

interface MedicamentFormProps {
  initialData?: MedicamentCreate & { idMedicament?: number };
  isEdit?: boolean;
}

const ouiNonOptions = [
  { value: 'true', label: 'Oui' },
  { value: 'false', label: 'Non' }
];

export default function MedicamentForm({ initialData, isEdit = false }: MedicamentFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<MedicamentCreate>(() => initialData ? {
    codeCip: initialData.codeCip,
    codeCis: initialData.codeCis || '',
    nomCommercial: initialData.nomCommercial,
    denominationCommune: initialData.denominationCommune || '',
    formePharmaceutique: initialData.formePharmaceutique || '',
    dosage: initialData.dosage || '',
    presentation: initialData.presentation || '',
    voieAdministration: initialData.voieAdministration || '',
    idCategorie: initialData.idCategorie,
    laboratoire: initialData.laboratoire || '',
    substanceActive: initialData.substanceActive || '',
    excipients: initialData.excipients || '',
    indications: initialData.indications || '',
    contreIndications: initialData.contreIndications || '',
    effetsSecondaires: initialData.effetsSecondaires || '',
    precautionsEmploi: initialData.precautionsEmploi || '',
    conservationConditions: initialData.conservationConditions || '',
    temperatureConservation: initialData.temperatureConservation || '',
    dureeConservationMois: initialData.dureeConservationMois,
    prescriptionObligatoire: initialData.prescriptionObligatoire,
    listePsychotrope: initialData.listePsychotrope,
    generique: initialData.generique,
    idGeneriqueParent: initialData.idGeneriqueParent,
    prixAchat: initialData.prixAchat,
    prixVente: initialData.prixVente,
    tauxRemboursement: initialData.tauxRemboursement,
    stockMinimum: initialData.stockMinimum,
    stockMaximum: initialData.stockMaximum,
    datePeremptionAlerte: initialData.datePeremptionAlerte,
    actif: initialData.actif,
  } : {
    codeCip: '',
    codeCis: '',
    nomCommercial: '',
    denominationCommune: '',
    formePharmaceutique: '',
    dosage: '',
    presentation: '',
    voieAdministration: '',
    idCategorie: null,
    laboratoire: '',
    substanceActive: '',
    excipients: '',
    indications: '',
    contreIndications: '',
    effetsSecondaires: '',
    precautionsEmploi: '',
    conservationConditions: '',
    temperatureConservation: '',
    dureeConservationMois: null,
    prescriptionObligatoire: false,
    listePsychotrope: false,
    generique: false,
    idGeneriqueParent: null,
    prixAchat: null,
    prixVente: null,
    tauxRemboursement: null,
    stockMinimum: 10,
    stockMaximum: 100,
    datePeremptionAlerte: 30,
    actif: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [initialLoading] = useState(isEdit && !initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean | null = value;
    if (type === 'number') newValue = value === '' ? null : Number(value);
    if (type === 'checkbox') newValue = (e.target as HTMLInputElement).checked;
    if (type === 'select-one') {
      if (['prescriptionObligatoire', 'listePsychotrope', 'generique', 'actif'].includes(name)) {
        newValue = value === 'true';
      }
    }
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleCategorieChange = (id: number | null) => {
    setFormData(prev => ({ ...prev, idCategorie: id }));
    if (errors.idCategorie) setErrors(prev => ({ ...prev, idCategorie: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.codeCip?.trim()) newErrors.codeCip = 'Code CIP requis';
    if (!formData.nomCommercial?.trim()) newErrors.nomCommercial = 'Nom commercial requis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Veuillez corriger les erreurs');
      return;
    }
    setLoading(true);
    try {
      if (isEdit && initialData?.idMedicament) {
        await medicamentService.update(initialData.idMedicament, formData);
        toast.success('Médicament mis à jour');
      } else {
        await medicamentService.create(formData);
        toast.success('Médicament créé');
      }
      router.push('/pharmacie/medicaments');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <SkeletonDetails />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Modifier le médicament' : 'Nouveau médicament'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/medicaments')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Identifiants */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2"><FaPills /> Informations générales</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Code CIP" name="codeCip" value={formData.codeCip} onChange={handleChange} required error={errors.codeCip} />
                <FormInput label="Code CIS" name="codeCis" value={formData.codeCis || ''} onChange={handleChange} />
                <FormInput label="Nom commercial" name="nomCommercial" value={formData.nomCommercial} onChange={handleChange} required error={errors.nomCommercial} />
                <FormInput label="Dénomination commune" name="denominationCommune" value={formData.denominationCommune || ''} onChange={handleChange} />
                <FormInput label="Forme pharmaceutique" name="formePharmaceutique" value={formData.formePharmaceutique || ''} onChange={handleChange} />
                <FormInput label="Dosage" name="dosage" value={formData.dosage || ''} onChange={handleChange} />
                <FormInput label="Présentation" name="presentation" value={formData.presentation || ''} onChange={handleChange} />
                <FormInput label="Voie d'administration" name="voieAdministration" value={formData.voieAdministration || ''} onChange={handleChange} />
                <div className="col-span-1">
                  <CategorieSelect value={formData.idCategorie} onChange={handleCategorieChange} />
                </div>
                <FormInput label="Laboratoire" name="laboratoire" value={formData.laboratoire || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Composition */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2"><FaFlask /> Composition</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextarea label="Substance active" name="substanceActive" value={formData.substanceActive || ''} onChange={handleChange} rows={2} />
                <FormTextarea label="Excipients" name="excipients" value={formData.excipients || ''} onChange={handleChange} rows={2} />
              </div>
            </div>

            {/* Informations médicales */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2"><FaClipboardList /> Informations médicales</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextarea label="Indications" name="indications" value={formData.indications || ''} onChange={handleChange} rows={2} />
                <FormTextarea label="Contre-indications" name="contreIndications" value={formData.contreIndications || ''} onChange={handleChange} rows={2} />
                <FormTextarea label="Effets secondaires" name="effetsSecondaires" value={formData.effetsSecondaires || ''} onChange={handleChange} rows={2} />
                <FormTextarea label="Précautions d'emploi" name="precautionsEmploi" value={formData.precautionsEmploi || ''} onChange={handleChange} rows={2} />
              </div>
            </div>

            {/* Conservation */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600">Conservation</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormTextarea label="Conditions" name="conservationConditions" value={formData.conservationConditions || ''} onChange={handleChange} rows={2} className="col-span-2" />
                <FormInput label="Température" name="temperatureConservation" value={formData.temperatureConservation || ''} onChange={handleChange} />
                <FormInput label="Durée (mois)" name="dureeConservationMois" type="number" value={formData.dureeConservationMois?.toString() || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Réglementation et prix */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2"><FaEuroSign /> Réglementation &amp; Prix ($)</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormSelect label="Prescription obligatoire" name="prescriptionObligatoire" value={formData.prescriptionObligatoire ? 'true' : 'false'} onChange={handleChange} options={ouiNonOptions} />
                <FormSelect label="Liste psychotrope" name="listePsychotrope" value={formData.listePsychotrope ? 'true' : 'false'} onChange={handleChange} options={ouiNonOptions} />
                <FormSelect label="Générique" name="generique" value={formData.generique ? 'true' : 'false'} onChange={handleChange} options={ouiNonOptions} />
                <FormInput label="ID générique parent" name="idGeneriqueParent" type="number" value={formData.idGeneriqueParent?.toString() || ''} onChange={handleChange} />
                <FormInput label="Prix d'achat ($)" name="prixAchat" type="number" step="0.001" value={formData.prixAchat?.toString() || ''} onChange={handleChange} />
                <FormInput label="Prix de vente ($)" name="prixVente" type="number" step="0.001" value={formData.prixVente?.toString() || ''} onChange={handleChange} />
                <FormInput label="Taux remboursement (%)" name="tauxRemboursement" type="number" value={formData.tauxRemboursement?.toString() || ''} onChange={handleChange} />
              </div>
            </div>

            {/* Stock */}
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
              <h5 className="text-lg font-semibold text-indigo-600 flex items-center gap-2"><FaBoxes /> Gestion des stocks</h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormInput label="Stock minimum" name="stockMinimum" type="number" value={formData.stockMinimum.toString()} onChange={handleChange} />
                <FormInput label="Stock maximum" name="stockMaximum" type="number" value={formData.stockMaximum.toString()} onChange={handleChange} />
                <FormInput label="Alerte péremption (jours)" name="datePeremptionAlerte" type="number" value={formData.datePeremptionAlerte.toString()} onChange={handleChange} />
                <FormSelect label="Actif" name="actif" value={formData.actif ? 'true' : 'false'} onChange={handleChange} options={ouiNonOptions} />
              </div>
            </div>
          </div>

          {/* Notes - colonne de droite */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
                <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaClipboardList /> Informations complémentaires</h5>
              </div>
              <div className="p-6">
                <p className="text-sm text-gray-600">Aucune note spécifique pour ce médicament.</p>
                <div className="mt-4 p-3 bg-blue-50 rounded-md text-xs text-blue-700">
                  Les champs marqués d&apos;une étoile (*) sont obligatoires.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8">
          <Button type="button" variant="secondary" onClick={() => router.push('/pharmacie/medicaments')}>Annuler</Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Enregistrement...' : (isEdit ? 'Mettre à jour' : 'Créer')}
          </Button>
        </div>
      </form>
    </div>
  );
}
