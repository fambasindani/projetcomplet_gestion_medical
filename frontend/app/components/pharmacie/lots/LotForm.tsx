// app/components/pharmacie/lots/LotForm.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaBoxes, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { FormInput } from '../../common/FormInput';
import { FormTextarea } from '../../common/FormTextarea';
import { FormSelect } from '../../common/FormSelect';
import { MedicamentSearchSelect } from '../../common/MedicamentSearchSelect';
import { FournisseurSearchSelect } from '../../common/FournisseurSearchSelect';
import { lotService } from '@/app/services/lotService';
import { LotCreate, LotMedicament, StatutLot } from '@/app/types/lot';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

interface LotFormProps {
  initialData?: LotMedicament | null;
  isEdit?: boolean;
}

const statutOptions = Object.values(StatutLot).map(s => ({ value: s, label: s }));

export default function LotForm({ initialData, isEdit = false }: LotFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LotCreate>(() => initialData ? {
    idMedicament: initialData.idMedicament,
    numeroLot: initialData.numeroLot,
    idFournisseur: initialData.idFournisseur,
    dateFabrication: initialData.dateFabrication ? initialData.dateFabrication.slice(0, 16) : null,
    datePeremption: initialData.datePeremption.slice(0, 16),
    quantiteInitial: initialData.quantiteInitial,
    quantiteRestante: initialData.quantiteRestante,
    prixAchatUnitaire: initialData.prixAchatUnitaire,
    prixVenteUnitaire: initialData.prixVenteUnitaire,
    emplacementStockage: initialData.emplacementStockage || '',
    dateReception: initialData.dateReception ? initialData.dateReception.slice(0, 16) : null,
    bonCommande: initialData.bonCommande || '',
    factureFournisseur: initialData.factureFournisseur || '',
    controleQualite: initialData.controleQualite,
    statut: initialData.statut,
    notes: initialData.notes || '',
  } : {
    idMedicament: 0,
    numeroLot: '',
    idFournisseur: null,
    dateFabrication: null,
    datePeremption: '',
    quantiteInitial: 0,
    quantiteRestante: 0,
    prixAchatUnitaire: null,
    prixVenteUnitaire: null,
    emplacementStockage: '',
    dateReception: null,
    bonCommande: '',
    factureFournisseur: '',
    controleQualite: false,
    statut: StatutLot.Disponible,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean | null = value;
    if (type === 'number') newValue = value === '' ? null : Number(value);
    if (type === 'checkbox') newValue = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.idMedicament) newErrors.idMedicament = 'Médicament requis';
    if (!formData.numeroLot?.trim()) newErrors.numeroLot = 'Numéro de lot requis';
    if (!formData.datePeremption) newErrors.datePeremption = 'Date de péremption requise';
    if (!formData.quantiteInitial || formData.quantiteInitial <= 0) newErrors.quantiteInitial = 'Quantité initiale positive requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        ...formData,
        dateFabrication: formData.dateFabrication ? new Date(formData.dateFabrication).toISOString() : null,
        datePeremption: new Date(formData.datePeremption).toISOString(),
        dateReception: formData.dateReception ? new Date(formData.dateReception).toISOString() : null,
      };
      if (isEdit && initialData?.idLot) {
        await lotService.update(initialData.idLot, payload);
        toast.success('Lot modifié');
      } else {
        await lotService.create(payload);
        toast.success('Lot créé');
      }
      router.push('/pharmacie/lots');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && !initialData) return <SkeletonDetails />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isEdit ? 'Modifier le lot' : 'Nouveau lot'}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/lots')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <MedicamentSearchSelect
                value={formData.idMedicament}
                onChange={(id) => setFormData(prev => ({ ...prev, idMedicament: id || 0 }))}
                error={errors.idMedicament}
                required
              />
            </div>
            <FormInput
              label="Numéro de lot"
              name="numeroLot"
              value={formData.numeroLot}
              onChange={handleChange}
              required
              error={errors.numeroLot}
              icon={<FaBoxes />}
            />
            <div className="lg:col-span-2">
              <FournisseurSearchSelect
                value={formData.idFournisseur}
                onChange={(id) => setFormData(prev => ({ ...prev, idFournisseur: id }))}
              />
            </div>
            <FormSelect
              label="Statut"
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              options={statutOptions}
            />
            <FormInput
              label="Date de fabrication"
              name="dateFabrication"
              type="datetime-local"
              value={formData.dateFabrication || ''}
              onChange={handleChange}
              icon={<FaCalendarAlt />}
            />
            <FormInput
              label="Date de péremption"
              name="datePeremption"
              type="datetime-local"
              value={formData.datePeremption}
              onChange={handleChange}
              required
              error={errors.datePeremption}
              icon={<FaCalendarAlt />}
            />
            <FormInput
              label="Quantité initiale"
              name="quantiteInitial"
              type="number"
              value={formData.quantiteInitial?.toString() || ''}
              onChange={handleChange}
              required
              error={errors.quantiteInitial}
            />
            <FormInput
              label="Quantité restante"
              name="quantiteRestante"
              type="number"
              value={formData.quantiteRestante?.toString() || ''}
              onChange={handleChange}
            />
            <FormInput
              label="Prix d'achat unitaire ($)"
              name="prixAchatUnitaire"
              type="number"
              step="0.001"
              value={formData.prixAchatUnitaire?.toString() || ''}
              onChange={handleChange}
              icon={<FaDollarSign />}
            />
            <FormInput
              label="Prix de vente unitaire ($)"
              name="prixVenteUnitaire"
              type="number"
              step="0.001"
              value={formData.prixVenteUnitaire?.toString() || ''}
              onChange={handleChange}
              icon={<FaDollarSign />}
            />
            <FormInput
              label="Emplacement stockage"
              name="emplacementStockage"
              value={formData.emplacementStockage || ''}
              onChange={handleChange}
            />
            <FormInput
              label="Date réception"
              name="dateReception"
              type="datetime-local"
              value={formData.dateReception || ''}
              onChange={handleChange}
              icon={<FaCalendarAlt />}
            />
            <FormInput
              label="Bon commande"
              name="bonCommande"
              value={formData.bonCommande || ''}
              onChange={handleChange}
            />
            <FormInput
              label="Facture fournisseur"
              name="factureFournisseur"
              value={formData.factureFournisseur || ''}
              onChange={handleChange}
            />
            <div className="flex items-center pt-6">
              <input
                type="checkbox"
                id="controleQualite"
                name="controleQualite"
                checked={formData.controleQualite}
                onChange={handleChange}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="controleQualite" className="ml-2 text-sm text-gray-700">
                Contrôle qualité
              </label>
            </div>
            <FormTextarea
              label="Notes"
              name="notes"
              value={formData.notes || ''}
              onChange={handleChange}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.push('/pharmacie/lots')}>Annuler</Button>
            <Button type="submit" disabled={loading} icon={<FaSave />}>
              {loading ? 'Enregistrement...' : (isEdit ? 'Modifier' : 'Ajouter')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
