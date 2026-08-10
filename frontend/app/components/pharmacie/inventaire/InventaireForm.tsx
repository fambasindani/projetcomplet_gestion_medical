// app/components/pharmacie/inventaire/InventaireForm.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft, FaPlus, FaTrash } from 'react-icons/fa';
import { inventaireService } from '@/app/services/inventaireService';
import { TypeInventaire, LigneInventaire } from '@/app/types/inventaire';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { personnelService } from '@/app/services/personnelService';
import { LotSearchSelect } from '@/app/components/common/LotSearchSelect';
import { MedicamentSearchSelect } from '@/app/components/common/MedicamentSearchSelect';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import PageHeader from '@/app/ui/PageHeader';
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.realisePar || form.lignes.length === 0) {
      toast.error('Veuillez remplir les champs obligatoires et ajouter une ligne');
      return;
    }
    setLoading(true);
    try {
      await inventaireService.create({
        ...form,
        typeInventaire: form.typeInventaire as TypeInventaire,
        dateInventaire: new Date(form.dateInventaire).toISOString(),
        lignes: form.lignes.map(l => ({
          ...l,
          prixUnitaire: l.prixUnitaire || 0,
        })),
      });
      toast.success('Inventaire créé avec succès');
      router.push('/pharmacie/inventaire');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvel inventaire"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/inventaire')}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormInput
              label="Date *"
              type="datetime-local"
              value={form.dateInventaire}
              onChange={(e) => setForm({...form, dateInventaire: e.target.value})}
            />
            <FormSelect
              label="Type *"
              value={form.typeInventaire}
              onChange={(e) => setForm({...form, typeInventaire: e.target.value})}
              options={[
                { value: 'Annuel', label: 'Annuel' },
                { value: 'Trimestriel', label: 'Trimestriel' },
                { value: 'Mensuel', label: 'Mensuel' },
                { value: 'Tournant', label: 'Tournant' },
                { value: 'Exceptionnel', label: 'Exceptionnel' },
              ]}
            />
            <FormSelect
              label="Réalisateur *"
              value={form.realisePar}
              onChange={(e) => setForm({...form, realisePar: Number(e.target.value)})}
              options={[
                { value: 0, label: '-- Choisir --' },
                ...personnels.map(p => ({ value: p.idPersonnel, label: `${p.nom} ${p.prenom}` })),
              ]}
            />
          </div>

          <FormTextarea
            label="Observations"
            value={form.observations}
            onChange={(e) => setForm({...form, observations: e.target.value})}
            rows={2}
          />

          <div className="border-t pt-4">
            <h4 className="font-semibold mb-3">Lignes d&apos;inventaire</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-gray-50 p-4 rounded-lg">
              <MedicamentSearchSelect
                label="Médicament"
                value={currentLigne.idMedicament}
                onChange={(id) => setCurrentLigne({...currentLigne, idMedicament: id || 0})}
              />
              <LotSearchSelect
                label="Lot"
                value={currentLigne.idLot}
                onChange={(id) => setCurrentLigne({...currentLigne, idLot: id || 0})}
                medicamentId={currentLigne.idMedicament || undefined}
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
              <button
                type="button"
                onClick={addLigne}
                className="bg-indigo-600 text-white mt-6 rounded flex items-center justify-center gap-2 h-10"
              >
                <FaPlus /> Ajouter
              </button>
            </div>

            {form.lignes.length > 0 && (
              <table className="w-full text-sm mt-4 border rounded-lg overflow-hidden">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Médicament</th>
                    <th className="p-3 text-left">Lot</th>
                    <th className="p-3 text-center">Qté</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {form.lignes.map((l, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="p-3">{l.idMedicament}</td>
                      <td className="p-3">{l.idLot}</td>
                      <td className="p-3 text-center">{l.quantiteReelle}</td>
                      <td className="p-3 text-center">
                        <button type="button" onClick={() => removeLigne(idx)} className="text-red-500 hover:text-red-700">
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="secondary" onClick={() => router.push('/pharmacie/inventaire')}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading} icon={<FaSave />}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
