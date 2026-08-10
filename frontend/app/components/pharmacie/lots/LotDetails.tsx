'use client';

import { useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaBox, FaCalendarCheck,
  FaDollarSign, FaTruck, FaClipboardList, FaEdit
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';
import PageHeader from '@/app/ui/PageHeader';
import { lotService } from '@/app/services/lotService';
import { LotMedicament } from '@/app/types/lot';

const statutStyles: Record<string, string> = {
  Disponible: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Rupture: 'bg-red-50 text-red-700 border-red-200',
  Périmé: 'bg-slate-50 text-slate-700 border-slate-200',
  Retiré: 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function LotDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [lot, setLot] = useState<LotMedicament | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLot = useCallback(async () => {
    try {
      const data = await lotService.getById(Number(id));
      setLot(data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => {
    void (async () => { await fetchLot(); })();
  }, [fetchLot]);

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer le lot ${lot?.numeroLot} ?` });
    if (!ok) return;
    try {
      await lotService.delete(Number(id));
      toast.success('Lot supprimé');
      router.push('/pharmacie/lots');
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  if (loading) return <SkeletonDetails />;
  if (!lot) return (
    <EmptyState
      icon={<FaBox />}
      title="Lot introuvable"
      description="Le lot demandé n'existe pas ou a été supprimé."
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={lot.medicamentNom || 'Médicament'}
        subtitle={`Lot #${lot.numeroLot}`}
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/lots')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/pharmacie/lots/${id}/modifier`)}>
              Modifier
            </Button>
            <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">{lot.medicamentNom || 'Médicament'}</h1>
              <p className="opacity-90 flex items-center gap-2 font-mono">
                <FaBox /> Lot #{lot.numeroLot}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statutStyles[lot.statut] || 'bg-gray-50'}`}>
              {lot.statut}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Section Informations */}
          <div className="grid md:grid-cols-3 gap-8">
            <InfoGroup title="Logistique" icon={FaTruck}>
              <Detail label="Fournisseur" value={lot.fournisseurNom} />
              <Detail label="Emplacement" value={lot.emplacementStockage} />
              <Detail label="Contrôle Qualité" value={lot.controleQualite ? 'Validé' : 'En attente'} />
            </InfoGroup>

            <InfoGroup title="Traçabilité" icon={FaCalendarCheck}>
              <Detail label="Réception" value={lot.dateReception && format(new Date(lot.dateReception), 'dd/MM/yyyy')} />
              <Detail label="Péremption" value={format(new Date(lot.datePeremption), 'dd/MM/yyyy')} />
              <Detail label="Fabrication" value={lot.dateFabrication && format(new Date(lot.dateFabrication), 'dd/MM/yyyy')} />
            </InfoGroup>

            <InfoGroup title="Gestion Stock" icon={FaDollarSign}>
              <Detail label="Initial" value={lot.quantiteInitial} />
              <Detail label="Restant" value={<span className="font-bold text-indigo-600">{lot.quantiteRestante}</span>} />
              <Detail label="Prix Achat/Vente" value={`$${lot.prixAchatUnitaire} / $${lot.prixVenteUnitaire}`} />
            </InfoGroup>
          </div>

          {lot.notes && (
            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><FaClipboardList /> Notes</h3>
              <p className="text-gray-600 text-sm">{lot.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoGroup({ title, icon: Icon, children }: { title: string; icon: IconType; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Icon className="text-indigo-500" /> {title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value?: ReactNode }) {
  return <p className="text-sm"><span className="text-gray-500">{label}:</span> <span className="font-medium text-gray-900 ml-2">{value || '-'}</span></p>;
}
