'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaDollarSign, FaBed, FaSyringe } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { SpecialiteSearchSelect } from '@/app/components/common/SpecialiteSearchSelect';
import { chambreService } from '@/app/services/chambreService';
import { Chambre, ChambreCreate, StatutChambre, TypeChambre } from '@/app/types/chambre';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';

interface ChambreFormProps {
  initialData?: Chambre;
  isEditing?: boolean;
}

const statutOptions = Object.values(StatutChambre).map(s => ({ value: s, label: s }));
const typeOptions = Object.values(TypeChambre).map(t => ({ value: t, label: t }));

const ChambreForm: React.FC<ChambreFormProps> = ({ initialData, isEditing = false }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<ChambreCreate>>(() => initialData ? {
    numeroChambre: initialData.numeroChambre,
    etage: initialData.etage,
    batiment: initialData.batiment,
    typeChambre: initialData.typeChambre,
    statut: initialData.statut,
    prixJour: initialData.prixJour,
    idSpecialite: initialData.idSpecialite,
    equipements: initialData.equipements,
    telephone: initialData.telephone,
    television: initialData.television,
    wifi: initialData.wifi,
    salleBainPrivee: initialData.salleBainPrivee,
    accessibiliteHandicape: initialData.accessibiliteHandicape,
    notes: initialData.notes,
  } : {
    numeroChambre: '',
    etage: null,
    batiment: '',
    typeChambre: TypeChambre.Individuelle,
    statut: StatutChambre.Disponible,
    prixJour: null,
    idSpecialite: null,
    equipements: '',
    telephone: false,
    television: false,
    wifi: false,
    salleBainPrivee: true,
    accessibiliteHandicape: true,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value === '' ? null : value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSpecialiteChange = (id: number | null) => {
    setFormData(prev => ({ ...prev, idSpecialite: id }));
    if (errors.idSpecialite) setErrors(prev => ({ ...prev, idSpecialite: '' }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.numeroChambre?.trim()) newErrors.numeroChambre = 'Le numéro de chambre est requis';
    if (!formData.typeChambre) newErrors.typeChambre = 'Le type de chambre est requis';
    if (!formData.statut) newErrors.statut = 'Le statut est requis';
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
      const dataToSend = {
        ...formData,
        prixJour: formData.prixJour ? parseFloat(formData.prixJour.toString()) : null,
        etage: formData.etage ? parseInt(formData.etage.toString()) : null,
      };
      if (isEditing && initialData) {
        await chambreService.update(initialData.idChambre, dataToSend);
        toast.success('Chambre mise à jour');
      } else {
        await chambreService.create(dataToSend as ChambreCreate);
        toast.success('Chambre créée');
      }
      router.push('/hospitalisations/chambres');
    } catch (error) {
      console.error(error);
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title={isEditing ? `Modifier la chambre ${initialData?.numeroChambre || ''}` : 'Nouvelle chambre'}
      onBack={() => router.push('/hospitalisations/chambres')}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <FormSection title="Informations générales" icon={<FaBed />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Numéro de chambre"
              name="numeroChambre"
              value={formData.numeroChambre || ''}
              onChange={handleChange}
              required
              error={errors.numeroChambre}
              placeholder="ex: 101A"
            />
            <FormSelect
              label="Type de chambre"
              name="typeChambre"
              value={formData.typeChambre || ''}
              onChange={handleChange}
              options={typeOptions}
              required
              error={errors.typeChambre}
            />
            <FormInput
              label="Étage"
              name="etage"
              type="number"
              value={formData.etage != null ? formData.etage.toString() : ''}
              onChange={handleChange}
              placeholder="0 pour RDC"
            />
            <FormInput
              label="Bâtiment"
              name="batiment"
              value={formData.batiment || ''}
              onChange={handleChange}
              placeholder="A, B, Principal, etc."
            />
            <FormSelect
              label="Statut"
              name="statut"
              value={formData.statut || ''}
              onChange={handleChange}
              options={statutOptions}
              required
              error={errors.statut}
            />
            <FormInput
              label="Prix par jour (USD)"
              name="prixJour"
              type="number"
              step="0.01"
              value={formData.prixJour != null ? formData.prixJour.toString() : ''}
              onChange={handleChange}
              icon={<FaDollarSign />}
              placeholder="0.00"
            />
            <div className="md:col-span-2">
              <SpecialiteSearchSelect
                value={formData.idSpecialite || null}
                onChange={handleSpecialiteChange}
                error={errors.idSpecialite}
              />
            </div>
            <div className="md:col-span-2">
              <FormInput
                label="Équipements"
                name="equipements"
                value={formData.equipements || ''}
                onChange={handleChange}
                placeholder="Climatisation, lit médicalisé, etc."
              />
            </div>
          </div>
        </FormSection>

        {/* Équipements checkbox */}
        <FormSection title="Équipements" icon={<FaSyringe />}>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="telephone" checked={formData.telephone || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              Téléphone
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="television" checked={formData.television || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              Télévision
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="wifi" checked={formData.wifi || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              WiFi
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="salleBainPrivee" checked={formData.salleBainPrivee || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              Salle de bain privée
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="accessibiliteHandicape" checked={formData.accessibiliteHandicape || false} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
              Accessible handicapés
            </label>
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection title="Notes">
          <FormTextarea
            label=""
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            placeholder="Informations complémentaires..."
          />
        </FormSection>

        {/* Boutons en bas */}
        <FormActions
          onCancel={() => router.push('/hospitalisations/chambres')}
          loading={loading}
          submitLabel={isEditing ? 'Mettre à jour' : 'Créer'}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
};

export default ChambreForm;
