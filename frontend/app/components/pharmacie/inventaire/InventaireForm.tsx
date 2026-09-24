// app/components/pharmacie/inventaire/InventaireForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaPlus, FaTrash, FaDownload, FaSpinner } from 'react-icons/fa';
import { inventaireService } from '@/app/services/inventaireService';
import { TypeInventaire, LigneInventaire } from '@/app/types/inventaire';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { personnelService } from '@/app/services/personnelService';
import { LotSearchSelect } from '@/app/components/common/LotSearchSelect';
import { MedicamentSearchSelect } from '@/app/components/common/MedicamentSearchSelect';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import Button from '@/app/ui/Button';

export default function InventaireForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [personnels, setPersonnels] = useState<{ idPersonnel: number; nom: string; prenom: string }[]>([]);
  const [form, setForm] = useState({
    dateInventaire: new Date().toISOString().slice(0, 16),
    typeInventaire: 'Annuel',
    realisePar: 0,
    observations: '',
    lignes: [] as LigneInventaire[],
  });
  const [currentLigne, setCurrentLigne] = useState({
    idMedicament: 0, idLot: 0, quantiteTheorique: 0, quantiteReelle: 0, raisonEcart: '', prixUnitaire: 0,
  });

  useEffect(() => {
    personnelService.getAll(1, 100)
      .then(res => {
        const items = res.items.map((p) => ({
          idPersonnel: p.idPersonnel,
          nom: p.nom,
          prenom: p.prenom,
        }));
        setPersonnels(items);
      })
      .catch(console.error);
  }, []);

  const addLigne = () => {
    if (!currentLigne.idMedicament || !currentLigne.idLot) {
      toast.error('Médicament et lot requis');
      return;
    }
    setForm(prev => ({ ...prev, lignes: [...prev.lignes, { ...currentLigne }] }));
    setCurrentLigne({ idMedicament: 0, idLot: 0, quantiteTheorique: 0, quantiteReelle: 0, raisonEcart: '', prixUnitaire: 0 });
  };

  const removeLigne = (idx: number) => {
    setForm(prev => ({ ...prev, lignes: prev.lignes.filter((_, i) => i !== idx) }));
  };

  const updateLigne = (idx: number, field: 'quantiteReelle' | 'raisonEcart', value: number | string) => {
    setForm(prev => ({
      ...prev,
      lignes: prev.lignes.map((l, i) => (i === idx ? { ...l, [field]: value } : l)),
    }));
  };

  const [loadingStock, setLoadingStock] = useState(false);

  const chargerTousLesProduits = async () => {
    setLoadingStock(true);
    try {
      const stock = await inventaireService.getStockTheorique();
      const lignes: LigneInventaire[] = stock.map(s => ({
        idMedicament: s.idMedicament,
        medicamentNom: s.medicamentNom ?? undefined,
        idLot: s.idLot,
        lotNumero: s.numeroLot ?? undefined,
        quantiteTheorique: s.quantiteTheorique,
        quantiteReelle: s.quantiteTheorique,
        raisonEcart: '',
        prixUnitaire: s.prixUnitaire ?? 0,
      }));
      setForm(prev => ({ ...prev, lignes }));
      if (lignes.length === 0) {
        toast('Aucun lot en stock à inventorier');
      } else {
        toast.success(`${lignes.length} produit(s) chargé(s) — ajustez les quantités réelles`);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoadingStock(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.realisePar || form.lignes.length === 0) {
      toast.error('Veuillez remplir les champs obligatoires et ajouter une ligne');
      return;
    }
    setLoading(true);
    try {
      const created = await inventaireService.create({
        ...form,
        typeInventaire: form.typeInventaire as TypeInventaire,
        dateInventaire: new Date(form.dateInventaire).toISOString(),
        lignes: form.lignes.map(l => ({
          ...l,
          prixUnitaire: l.prixUnitaire || 0,
        })),
      });
      toast.success('Inventaire créé — procès-verbal prêt à imprimer');
      router.push(`/pharmacie/inventaire/${created.idInventaire}/impression`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell
      title="Nouvel inventaire"
      onBack={() => router.back()}
      maxWidth="max-w-6xl"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <FormSection title="Informations générales">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Date"
              type="datetime-local"
              value={form.dateInventaire}
              onChange={(e) => setForm({...form, dateInventaire: e.target.value})}
              required
            />
            <FormSelect
              label="Type"
              value={form.typeInventaire}
              onChange={(e) => setForm({...form, typeInventaire: e.target.value})}
              options={[
                { value: 'Annuel', label: 'Annuel' },
                { value: 'Trimestriel', label: 'Trimestriel' },
                { value: 'Mensuel', label: 'Mensuel' },
                { value: 'Tournant', label: 'Tournant' },
                { value: 'Exceptionnel', label: 'Exceptionnel' },
              ]}
              required
            />
            <FormSelect
              label="Réalisateur"
              value={form.realisePar}
              onChange={(e) => setForm({...form, realisePar: Number(e.target.value)})}
              options={[
                { value: 0, label: '-- Choisir --' },
                ...personnels.map(p => ({ value: p.idPersonnel, label: `${p.nom} ${p.prenom}` })),
              ]}
              required
            />
          </div>

          <FormTextarea
            label="Observations"
            value={form.observations}
            onChange={(e) => setForm({...form, observations: e.target.value})}
            rows={2}
          />

          <div className="border-t pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-semibold">Lignes d&apos;inventaire</h4>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  icon={loadingStock ? <FaSpinner className="animate-spin" /> : <FaDownload size={12} />}
                  onClick={chargerTousLesProduits}
                  disabled={loadingStock}
                >
                  {loadingStock ? 'Chargement...' : 'Récupérer tous les produits'}
                </Button>
                {form.lignes.length > 0 && (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setForm(prev => ({ ...prev, lignes: [] }))}
                  >
                    Vider
                  </Button>
                )}
              </div>
            </div>
            <p className="mb-3 text-xs text-gray-500">
              Charge tous les lots avec leur stock théorique. Modifiez la quantité réelle comptée ; l&apos;écart est calculé automatiquement.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-lg">
              <MedicamentSearchSelect
                label="Médicament"
                value={currentLigne.idMedicament}
                onChange={(id) => setCurrentLigne({...currentLigne, idMedicament: id || 0})}
                required
              />
              <LotSearchSelect
                label="Lot"
                value={currentLigne.idLot}
                onChange={(id) => setCurrentLigne({...currentLigne, idLot: id || 0})}
                medicamentId={currentLigne.idMedicament || undefined}
                required
              />
              <FormInput
                label="Qté Réelle"
                type="number"
                value={currentLigne.quantiteReelle}
                onChange={(e) => setCurrentLigne({...currentLigne, quantiteReelle: Number(e.target.value)})}
              />
              <FormInput
                label="Prix Unitaire"
                type="number"
                step="0.001"
                value={currentLigne.prixUnitaire}
                onChange={(e) => setCurrentLigne({...currentLigne, prixUnitaire: Number(e.target.value)})}
              />
              <FormInput
                label="Raison Écart"
                value={currentLigne.raisonEcart}
                onChange={(e) => setCurrentLigne({...currentLigne, raisonEcart: e.target.value})}
              />
              <div className="flex items-end">
                <Button type="button" onClick={addLigne} icon={<FaPlus size={12} />} className="h-[42px] w-full">
                  Ajouter
                </Button>
              </div>
            </div>

            {form.lignes.length > 0 && (
              <table className="mt-4 w-full overflow-hidden rounded-lg text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Médicament</th>
                    <th className="p-3 text-left">Lot</th>
                    <th className="p-3 text-center">Théorique</th>
                    <th className="p-3 text-center">Réel</th>
                    <th className="p-3 text-center">Écart</th>
                    <th className="p-3 text-left">Raison</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.lignes.map((l, idx) => {
                    const ecart = (l.quantiteReelle ?? 0) - (l.quantiteTheorique ?? 0);
                    return (
                      <tr key={idx} className="border-t">
                        <td className="p-3">{l.medicamentNom ?? l.idMedicament}</td>
                        <td className="p-3 text-gray-600">{l.lotNumero ?? l.idLot}</td>
                        <td className="p-3 text-center">{l.quantiteTheorique}</td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            value={l.quantiteReelle}
                            onChange={(e) => updateLigne(idx, 'quantiteReelle', Number(e.target.value))}
                            className="w-24 rounded-lg border border-gray-300 p-2 text-center text-sm"
                          />
                        </td>
                        <td className={`p-3 text-center font-semibold ${ecart !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {ecart > 0 ? '+' : ''}{ecart}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={l.raisonEcart ?? ''}
                            onChange={(e) => updateLigne(idx, 'raisonEcart', e.target.value)}
                            placeholder="Raison de l'écart"
                            className="w-40 rounded-lg border border-gray-300 p-2 text-sm"
                          />
                        </td>
                        <td className="p-3 text-center">
                          <button type="button" onClick={() => removeLigne(idx)} className="text-red-500 hover:text-red-700">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.back()}
          loading={loading}
          submitLabel="Enregistrer"
          submitIcon={<FaSave />}
        />
      </form>
    </PageShell>
  );
}
