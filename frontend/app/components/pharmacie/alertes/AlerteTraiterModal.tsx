// app/components/pharmacie/AlerteTraiterModal.tsx
'use client';

import { useState } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import { alerteStockService } from '@/app/services/alerteStockService';
import type { AlerteStock } from '@/app/types/alerte';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import { toast } from 'react-hot-toast';
import { FormTextarea } from '../../common/FormTextarea';


interface Props {
  isOpen: boolean;
  alerte: AlerteStock;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AlerteTraiterModal({ isOpen, alerte, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action.trim()) {
      toast.error('Veuillez décrire l\'action entreprise');
      return;
    }
    setLoading(true);
    try {
      await alerteStockService.traiter(alerte.idAlerte, { traitee: true, actionEntreprise: action });
      toast.success('Alerte traitée');
      onSuccess();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex justify-between items-center rounded-t-xl">
          <h3 className="text-xl font-semibold text-white">Traiter l&apos;alerte</h3>
          <button onClick={onClose} className="text-white hover:text-gray-200"><FaTimes /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Médicament :</strong> {alerte.medicamentNom}</p>
            <p><strong>Type :</strong> {alerte.typeAlerte}</p>
            {alerte.seuilActuel !== null && <p><strong>Stock actuel :</strong> {alerte.seuilActuel}</p>}
            {alerte.seuilMinimum !== null && <p><strong>Seuil minimum :</strong> {alerte.seuilMinimum}</p>}
            {alerte.datePeremption && <p><strong>Date de péremption :</strong> {new Date(alerte.datePeremption).toLocaleDateString()}</p>}
          </div>
          <FormTextarea
            label="Action entreprise *"
            value={action}
            onChange={(e) => setAction(e.target.value)}
            rows={3}
            placeholder="Décrire l'action réalisée (ex: commande passée, réapprovisionnement, etc.)"
            required
          />
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} className="border px-4 py-2 rounded-lg">Annuler</button>
            <button type="submit" disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2">
              <FaSave /> {loading ? 'Enregistrement...' : 'Marquer comme traitée'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}