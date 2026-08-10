'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RendezVous } from '@/app/types/rendezvous';

interface AnnulationModalProps {
  isOpen: boolean;
  rendezVous: RendezVous | null;
  motif: string;
  onMotifChange: (motif: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const AnnulationModal: React.FC<AnnulationModalProps> = ({
  isOpen,
  rendezVous,
  motif,
  onMotifChange,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !rendezVous) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-4">Annuler le rendez-vous</h3>
        <p className="text-sm text-gray-600 mb-2">
          Rendez-vous du{' '}
          {format(new Date(rendezVous.dateRdv), 'dd/MM/yyyy HH:mm', { locale: fr })}
        </p>
        <textarea
          className="w-full border rounded-lg p-2 mt-2"
          rows={3}
          placeholder="Motif de l'annulation (obligatoire)"
          value={motif}
          onChange={(e) => onMotifChange(e.target.value)}
        />
        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
          >
            Confirmer {"l'annulation"}
          </button>
        </div>
      </div>
    </div>
  );
};