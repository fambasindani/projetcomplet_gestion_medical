'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import { FormInput } from '@/app/components/common/FormInput';
import { FormSelect } from '@/app/components/common/FormSelect';
import { FormTextarea } from '@/app/components/common/FormTextarea';
import { useAuth } from '@/app/contexts/AuthContext';
import { factureService } from '@/app/services/factureService';
import type { Facture, ModePaiement } from '@/app/types/facture';
import { ModePaiementLabels, ModePaiementValues } from '@/app/types/facture';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

interface PaiementFormProps {
  facture?: Facture | null;
}

const modePaiementOptions = ModePaiementValues.map((mode) => ({
  value: mode,
  label: ModePaiementLabels[mode],
}));

export default function PaiementForm({ facture }: PaiementFormProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [montant, setMontant] = useState(facture?.montantRestant ?? 0);
  const [modePaiement, setModePaiement] = useState<ModePaiement>(facture?.modePaiement ?? 'Espèces');
  const [referencePaiement, setReferencePaiement] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!facture) return null;

  const montantRestant = facture.montantRestant;

  const validate = (): boolean => {
    const err: Record<string, string> = {};
    if (!montant || montant <= 0) {
      err.montant = 'Le montant doit être supérieur à zéro';
    } else if (montant > montantRestant) {
      err.montant = `Le montant ne peut pas dépasser le restant dû (${montantRestant.toFixed(2)})`;
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await factureService.ajouterPaiement(facture.idFacture, {
        montant,
        modePaiement,
        referencePaiement: referencePaiement || null,
        encaissePar: user?.id ?? null,
        notes: notes || null,
      });
      toast.success('Paiement encaissé');
      router.push(`/factures/${facture.idFacture}`);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Encaisser un paiement"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push(`/factures/${facture.idFacture}`)}>
            Retour
          </Button>
        }
      />

      <form onSubmit={handleSubmit} noValidate className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 space-y-6">
          <div className="rounded-lg bg-indigo-50 p-4 text-sm text-indigo-700 flex justify-between">
            <span>Facture {facture.numeroFacture}</span>
            <span className="font-semibold">Restant : {montantRestant.toFixed(2)}</span>
          </div>

          <FormInput
            label="Montant"
            name="montant"
            type="number"
            step="0.01"
            min={0}
            value={montant}
            onChange={(e) => setMontant(parseFloat(e.target.value) || 0)}
            required
            error={errors.montant}
          />
          <FormSelect
            label="Mode de paiement"
            name="modePaiement"
            value={modePaiement}
            onChange={(e) => setModePaiement(e.target.value as ModePaiement)}
            options={modePaiementOptions}
            required
          />
          <FormInput
            label="Référence"
            name="referencePaiement"
            value={referencePaiement}
            onChange={(e) => setReferencePaiement(e.target.value)}
            placeholder="N° de chèque, virement..."
          />
          <FormTextarea
            label="Notes"
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.push(`/factures/${facture.idFacture}`)}>Annuler</Button>
          <Button type="submit" disabled={loading} icon={<FaSave />}>
            {loading ? 'Encaissement...' : 'Encaisser'}
          </Button>
        </div>
      </form>
    </div>
  );
}
