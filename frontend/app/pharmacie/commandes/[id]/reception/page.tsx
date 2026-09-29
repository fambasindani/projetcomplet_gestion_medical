'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from '@/app/utils/toast';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { commandeService } from '@/app/services/commandeService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageShell from '@/app/ui/PageShell';
import FormSection from '@/app/ui/FormSection';
import FormActions from '@/app/ui/FormActions';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import { FormInput } from '@/app/components/common/FormInput';

interface Ligne {
  idDetailCommande: number;
  medicamentNom: string;
  quantiteCommandee: number;
  quantiteRecue: string;
  numeroLot: string;
  datePeremption: string;
  emplacementStockage: string;
  prixVenteUnitaire: string;
}

export default function ReceptionCommandePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [numeroCommande, setNumeroCommande] = useState('');
  const [lignes, setLignes] = useState<Ligne[]>([]);

  useEffect(() => {
    commandeService.getById(Number(params.id))
      .then((cmd) => {
        setNumeroCommande(cmd.numeroCommande);
        setLignes((cmd.details ?? []).map((d) => ({
          idDetailCommande: d.idDetailCommande ?? 0,
          medicamentNom: d.medicamentNom ?? `Médicament #${d.idMedicament}`,
          quantiteCommandee: d.quantiteCommandee,
          quantiteRecue: String(d.quantiteCommandee ?? 0),
          numeroLot: '',
          datePeremption: '',
          emplacementStockage: '',
          prixVenteUnitaire: '',
        })));
      })
      .catch((e) => {
        toast.error(extractErrorMessage(e));
        router.push('/pharmacie/commandes');
      })
      .finally(() => setLoading(false));
  }, [params.id, router]);

  const update = (index: number, field: keyof Ligne, value: string) => {
    setLignes((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      complete: true,
      lignes: lignes.map((l) => ({
        idDetailCommande: l.idDetailCommande,
        quantiteRecue: parseInt(l.quantiteRecue) || 0,
        numeroLot: l.numeroLot || undefined,
        datePeremption: l.datePeremption ? new Date(l.datePeremption).toISOString() : undefined,
        emplacementStockage: l.emplacementStockage || undefined,
        prixVenteUnitaire: l.prixVenteUnitaire ? parseFloat(l.prixVenteUnitaire) : undefined,
      })),
    };
    setSaving(true);
    try {
      await commandeService.receptionner(Number(params.id), payload);
      toast.success('Commande réceptionnée, lots créés');
      router.push(`/pharmacie/commandes/${params.id}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonDetails />;

  return (
    <PageShell
      title={`Réception de la commande ${numeroCommande}`}
      subtitle="Saisissez les quantités réellement reçues, le n° de lot et la date de péremption"
      maxWidth="max-w-6xl"
      onBack={() => router.push(`/pharmacie/commandes/${params.id}`)}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormSection title="Lignes à réceptionner">
          <div className="space-y-5">
            {lignes.map((l, idx) => (
              <div key={l.idDetailCommande} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">
                  {l.medicamentNom}
                  <span className="ml-2 text-xs font-normal text-slate-400">
                    (commandé : {l.quantiteCommandee})
                  </span>
                </p>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
                  <FormInput
                    label="Qté reçue"
                    type="number"
                    min={0}
                    value={l.quantiteRecue}
                    onChange={(e) => update(idx, 'quantiteRecue', e.target.value)}
                  />
                  <FormInput
                    label="N° de lot"
                    value={l.numeroLot}
                    onChange={(e) => update(idx, 'numeroLot', e.target.value)}
                    placeholder="auto si vide"
                  />
                  <FormInput
                    label="Péremption"
                    type="date"
                    value={l.datePeremption}
                    onChange={(e) => update(idx, 'datePeremption', e.target.value)}
                  />
                  <FormInput
                    label="Emplacement"
                    value={l.emplacementStockage}
                    onChange={(e) => update(idx, 'emplacementStockage', e.target.value)}
                  />
                  <FormInput
                    label="Prix vente ($)"
                    type="number"
                    step="0.01"
                    min={0}
                    value={l.prixVenteUnitaire}
                    onChange={(e) => update(idx, 'prixVenteUnitaire', e.target.value)}
                  />
                </div>
              </div>
            ))}
            {lignes.length === 0 && (
              <p className="text-sm text-slate-500">Aucune ligne dans cette commande.</p>
            )}
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push(`/pharmacie/commandes/${params.id}`)}
          submitLabel="Valider la réception"
          loading={saving}
          loadingLabel="Réception..."
          submitIcon={<FaCheck />}
        />
      </form>
    </PageShell>
  );
}
