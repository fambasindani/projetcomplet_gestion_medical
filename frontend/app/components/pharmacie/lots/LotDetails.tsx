'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import {
  FaBox, FaCalendarCheck,
  FaDollarSign, FaTruck, FaClipboardList, FaEdit
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
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
    <PageShell
      title={lot.medicamentNom || 'Médicament'}
      subtitle={`Lot #${lot.numeroLot}`}
      onBack={() => router.back()}
      actions={
        <>
          <Button icon={<FaEdit />} onClick={() => router.push(`/pharmacie/lots/${id}/modifier`)}>
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </>
      }
    >
      <DetailBanner
        meta="Lot"
        title={lot.medicamentNom || 'Médicament'}
        subtitle={`Lot #${lot.numeroLot}`}
        badges={
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${statutStyles[lot.statut] || 'bg-slate-50'}`}>
            {lot.statut}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaTruck} label="Fournisseur" value={lot.fournisseurNom} />
          <InfoCard icon={FaBox} label="Emplacement" value={lot.emplacementStockage} />
          <InfoCard icon={FaClipboardList} label="Contrôle Qualité" value={lot.controleQualite ? 'Validé' : 'En attente'} />
          <InfoCard icon={FaCalendarCheck} label="Réception" value={lot.dateReception && format(new Date(lot.dateReception), 'dd/MM/yyyy')} />
          <InfoCard icon={FaCalendarCheck} label="Péremption" value={format(new Date(lot.datePeremption), 'dd/MM/yyyy')} />
          <InfoCard icon={FaCalendarCheck} label="Fabrication" value={lot.dateFabrication && format(new Date(lot.dateFabrication), 'dd/MM/yyyy')} />
          <InfoCard icon={FaBox} label="Quantité initiale" value={lot.quantiteInitial} />
          <InfoCard icon={FaBox} label="Quantité restante" value={<span className="font-bold text-indigo-600">{lot.quantiteRestante}</span>} />
          <InfoCard icon={FaDollarSign} label="Prix Achat / Vente" value={`$${lot.prixAchatUnitaire} / $${lot.prixVenteUnitaire}`} />
        </InfoGrid>

        {lot.notes && (
          <div className="px-6 pb-6">
            <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><FaClipboardList className="text-indigo-500" /> Notes</h3>
              <p className="text-gray-600 text-sm">{lot.notes}</p>
            </section>
          </div>
        )}
      </DetailBanner>
    </PageShell>
  );
}
