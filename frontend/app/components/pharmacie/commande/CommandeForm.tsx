'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaSave,
  FaPlus,
  FaTrash,
  FaTruck,
  FaBoxes,
  FaClipboardList,
  FaCheckCircle,
} from 'react-icons/fa';
import { FormInput } from '../../common/FormInput';
import { FormSelect } from '../../common/FormSelect';
import { FormTextarea } from '../../common/FormTextarea';
import { FournisseurSearchSelect } from '../../common/FournisseurSearchSelect';
import { MedicamentSearchSelect } from '../../common/MedicamentSearchSelect';
import { commandeService } from '@/app/services/commandeService';
import { CommandeCreate, StatutCommandeFournisseur, DetailCommande } from '@/app/types/commande';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import Button, { IconButton } from '@/app/ui/Button';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';

// Étendre localement DetailCommande pour inclure le nom du médicament (affichage)
type DetailCommandeExtended = DetailCommande & { nomMedicament?: string };

const statutOptions = Object.values(StatutCommandeFournisseur).map((s) => ({ value: s, label: s }));

interface Props {
  initialData?: CommandeCreate & { idCommande?: number };
  isEditing?: boolean;
}

export default function CommandeForm({ initialData, isEditing = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<CommandeCreate, 'details'> & { details: DetailCommandeExtended[] }>(() => initialData ? {
    numeroCommande: initialData.numeroCommande || '',
    idFournisseur: initialData.idFournisseur,
    dateLivraisonPrevue: initialData.dateLivraisonPrevue?.slice(0, 16) || null,
    dateLivraisonReelle: initialData.dateLivraisonReelle?.slice(0, 16) || null,
    statut: initialData.statut,
    montantTotal: initialData.montantTotal,
    modePaiement: initialData.modePaiement || '',
    paiementEffectue: initialData.paiementEffectue,
    notes: initialData.notes || '',
    commandePar: initialData.commandePar,
    details: initialData.details || [],
  } : {
    numeroCommande: '',
    idFournisseur: 0,
    dateLivraisonPrevue: null,
    dateLivraisonReelle: null,
    statut: StatutCommandeFournisseur.En_attente,
    montantTotal: null,
    modePaiement: '',
    paiementEffectue: false,
    notes: '',
    commandePar: null,
    details: [],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [newDetail, setNewDetail] = useState<DetailCommandeExtended>({
    idMedicament: 0,
    quantiteCommandee: 1,
    prixUnitaire: 0,
    remise: 0,
    nomMedicament: '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: string | number | boolean | null = value;
    if (type === 'number') newValue = value === '' ? null : Number(value);
    if (type === 'checkbox') newValue = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleFournisseurChange = (id: number | null) => {
    setFormData((prev) => ({ ...prev, idFournisseur: id || 0 }));
    if (errors.idFournisseur) setErrors((prev) => ({ ...prev, idFournisseur: '' }));
  };

  // Lors de la sélection du médicament, on stocke son nom dans le nouveau détail
  const handleMedicamentSelect = (id: number | null, nom?: string) => {
    setNewDetail((prev) => ({ ...prev, idMedicament: id || 0, nomMedicament: nom || '' }));
    if (errors.medicament) setErrors((prev) => ({ ...prev, medicament: '' }));
  };

  const addDetail = () => {
    if (!newDetail.idMedicament) {
      toast.error('Sélectionnez un médicament');
      return;
    }
    if (newDetail.quantiteCommandee <= 0) {
      toast.error('Quantité positive requise');
      return;
    }
    if (newDetail.prixUnitaire <= 0) {
      toast.error('Prix unitaire positif requis');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      details: [...prev.details, { ...newDetail }],
    }));
    // Réinitialiser le formulaire d'ajout
    setNewDetail({ idMedicament: 0, quantiteCommandee: 1, prixUnitaire: 0, remise: 0, nomMedicament: '' });
  };

  const removeDetail = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const updateDetail = (index: number, field: 'quantiteCommandee' | 'prixUnitaire' | 'remise', value: number) => {
    const updated = [...formData.details];
    updated[index] = { ...updated[index], [field]: value };
    setFormData((prev) => ({ ...prev, details: updated }));
  };

  const calculateTotals = () => {
    let totalHT = 0;
    let totalRemise = 0;
    formData.details.forEach((d) => {
      const prix = d.prixUnitaire || 0;
      const qte = d.quantiteCommandee || 0;
      const remise = d.remise || 0;
      const montant = prix * qte;
      totalHT += montant;
      totalRemise += montant * (remise / 100);
    });
    const net = totalHT - totalRemise;
    return { totalHT, totalRemise, net };
  };

  const { totalHT, totalRemise, net } = calculateTotals();

  const validate = () => {
    const err: Record<string, string> = {};
    if (!formData.idFournisseur) err.idFournisseur = 'Fournisseur requis';
    if (formData.details.length === 0) err.details = 'Au moins un médicament requis';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // On nettoie les détails : on retire le champ nomMedicament pour l'API
      const payload = {
        ...formData,
        montantTotal: net,
        details: formData.details.map((d) => ({
          idMedicament: d.idMedicament,
          quantiteCommandee: d.quantiteCommandee,
          prixUnitaire: d.prixUnitaire,
          remise: d.remise || 0,
        })),
      };
      if (isEditing && initialData?.idCommande) {
        await commandeService.update(initialData.idCommande, payload);
        toast.success('Commande modifiée');
      } else {
        await commandeService.create(payload);
        toast.success('Commande créée');
      }
      router.push('/pharmacie/commandes');
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <SkeletonDetails />;

  return (
    <PageShell
      title={isEditing ? 'Modifier la commande' : 'Nouvelle commande'}
      onBack={() => router.back()}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations générales */}
            <FormSection title="Informations générales" icon={<FaTruck />}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FournisseurSearchSelect
                  value={formData.idFournisseur}
                  onChange={handleFournisseurChange}
                  error={errors.idFournisseur}
                  required
                  label="Fournisseur"
                />
                <FormInput
                  label="Numéro commande"
                  name="numeroCommande"
                  value={formData.numeroCommande}
                  onChange={handleChange}
                  placeholder="Auto-généré si vide"
                />
                <FormSelect
                  label="Statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  options={statutOptions}
                />
                <FormInput
                  label="Date livraison prévue"
                  name="dateLivraisonPrevue"
                  type="datetime-local"
                  value={formData.dateLivraisonPrevue || ''}
                  onChange={handleChange}
                />
                <FormInput
                  label="Date livraison réelle"
                  name="dateLivraisonReelle"
                  type="datetime-local"
                  value={formData.dateLivraisonReelle || ''}
                  onChange={handleChange}
                />
                <FormInput
                  label="Mode paiement"
                  name="modePaiement"
                  value={formData.modePaiement || ''}
                  onChange={handleChange}
                  placeholder="Ex: Virement, Chèque..."
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="paiementEffectue"
                  name="paiementEffectue"
                  checked={formData.paiementEffectue}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="paiementEffectue" className="ml-2 text-sm text-gray-700">
                  Paiement effectué
                </label>
              </div>
            </FormSection>

            {/* Médicaments commandés */}
            <FormSection title="Médicaments commandés" icon={<FaBoxes />}>
              {/* Ligne d'ajout */}
              <div className="bg-slate-50 p-4 rounded-lg space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                  <div className="md:col-span-2">
                    <MedicamentSearchSelect
                      value={newDetail.idMedicament}
                      onChange={handleMedicamentSelect}
                      placeholder="Médicament"
                      label="Médicament"
                      required
                    />
                  </div>
                  <div>
                    <FormInput
                      type="number"
                      label="Quantité"
                      value={newDetail.quantiteCommandee}
                      onChange={(e) =>
                        setNewDetail((prev) => ({
                          ...prev,
                          quantiteCommandee: parseInt(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <FormInput
                      type="number"
                      step="0.01"
                      label="Prix unitaire ($)"
                      value={newDetail.prixUnitaire}
                      onChange={(e) =>
                        setNewDetail((prev) => ({
                          ...prev,
                          prixUnitaire: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <FormInput
                      type="number"
                      step="0.1"
                      label="Remise (%)"
                      value={newDetail.remise}
                      onChange={(e) =>
                        setNewDetail((prev) => ({
                          ...prev,
                          remise: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Button
                      type="button"
                      icon={<FaPlus size={12} />}
                      onClick={addDetail}
                      className="w-full justify-center"
                    >
                      Ajouter
                    </Button>
                  </div>
                </div>
                {errors.details && <p className="text-sm text-red-600 mt-1">{errors.details}</p>}
              </div>

              {/* Tableau des médicaments */}
              {formData.details.length > 0 && (
                <TableContainer>
                  <Table>
                    <THead>
                      <tr>
                        <Th>Médicament</Th>
                        <Th>Qté</Th>
                        <Th>Prix unit. ($)</Th>
                        <Th>Remise (%)</Th>
                        <Th>Total ($)</Th>
                        <Th align="center">Action</Th>
                      </tr>
                    </THead>
                    <TBody>
                      {formData.details.map((d, idx) => {
                        const totalLigne = d.prixUnitaire * d.quantiteCommandee * (1 - (d.remise || 0) / 100);
                        // Affichage du nom du médicament avec fallback sur l'ID
                        const nomAffiche = d.nomMedicament || `Médicament #${d.idMedicament}`;
                        return (
                          <Tr key={idx}>
                            <Td>{nomAffiche}</Td>
                            <Td>
                              <input
                                type="number"
                                value={d.quantiteCommandee}
                                onChange={(e) =>
                                  updateDetail(idx, 'quantiteCommandee', parseInt(e.target.value))
                                }
                                className="w-20 border rounded p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </Td>
                            <Td>
                              <input
                                type="number"
                                step="0.01"
                                value={d.prixUnitaire}
                                onChange={(e) =>
                                  updateDetail(idx, 'prixUnitaire', parseFloat(e.target.value))
                                }
                                className="w-24 border rounded p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </Td>
                            <Td>
                              <input
                                type="number"
                                step="0.1"
                                value={d.remise || 0}
                                onChange={(e) =>
                                  updateDetail(idx, 'remise', parseFloat(e.target.value))
                                }
                                className="w-20 border rounded p-1 text-sm focus:ring-indigo-500 focus:border-indigo-500"
                              />
                            </Td>
                            <Td>{totalLigne.toFixed(2)} $</Td>
                            <Td className="text-center">
                              <IconButton
                                type="button"
                                color="red"
                                title="Retirer"
                                onClick={() => removeDetail(idx)}
                              >
                                <FaTrash size={14} />
                              </IconButton>
                            </Td>
                          </Tr>
                        );
                      })}
                    </TBody>
                  </Table>
                </TableContainer>
              )}
            </FormSection>

            {/* Notes */}
            <FormSection>
              <FormTextarea
                label="Notes"
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                rows={3}
                placeholder="Informations complémentaires…"
              />
            </FormSection>
          </div>

          {/* Colonne latérale : résumé */}
          <div className="lg:col-span-1">
            <FormSection title="Récapitulatif" icon={<FaClipboardList />} className="sticky top-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Articles</span>
                <span className="font-medium">{formData.details.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total HT</span>
                <span className="font-medium">{totalHT.toFixed(2)} $</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Remise totale</span>
                <span className="font-medium text-red-600">- {totalRemise.toFixed(2)} $</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Net à payer</span>
                <span className="text-indigo-600">{net.toFixed(2)} $</span>
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
          submitLabel={isEditing ? 'Mettre à jour' : 'Créer'}
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
