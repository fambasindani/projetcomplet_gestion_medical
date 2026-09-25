'use client';

import { useCallback, useEffect, useState } from 'react';
import { BarChart, DonutChart } from '@/app/ui/Charts';
import PeriodeFilter, { type PeriodeFiltre } from '@/app/ui/PeriodeFilter';
import {
  FaDollarSign,
  FaFileInvoice,
  FaCheckCircle,
  FaHourglassHalf,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

import { toast } from 'react-hot-toast';
import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import Card from '@/app/components/common/Card';
import { factureService } from '@/app/services/factureService';
import type { FactureStats as FactureStatsData } from '@/app/types/facture';
import { StatutFactureLabels } from '@/app/types/facture';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const formatMois = (mois: string): string => {
  const parts = mois.split('-');
  if (parts.length === 2 && parts[0].length === 4) {
    return `${parts[1]}/${parts[0]}`;
  }
  if (parts.length === 2 && parts[1].length === 4) {
    return `${parts[0]}/${parts[1]}`;
  }
  return mois;
};

export default function FactureStats() {
  const [stats, setStats] = useState<FactureStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<PeriodeFiltre>({
    dateDebut: '',
    dateFin: '',
    granularite: 'month',
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await factureService.getStatistiques({
        dateDebut: filtre.dateDebut || null,
        dateFin: filtre.dateFin || null,
        granularite: filtre.granularite,
      });
      setStats(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [filtre]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  if (loading) return <SkeletonCards cards={4} />;
  if (!stats) {
    return <div className="p-12 text-center text-gray-500">Aucune donnée statistique disponible.</div>;
  }

  const totalEncaissement = stats.totalPaye;
  const tauxRecouvrement = stats.totalMontantEmis > 0
    ? Math.round((stats.totalPaye / stats.totalMontantEmis) * 100)
    : 0;

  const moisData = stats.parMois.map((item) => ({
    mois: formatMois(item.mois),
    montant: item.montant,
    nombre: item.nombre,
  }));

  const statutLabels = stats.parStatut.map((item) => StatutFactureLabels[item.statut]);
  const statutValues = stats.parStatut.map((item) => item.nombre);

  const cards: Array<{ label: string; value: string; icon: IconType; color: string; bg: string }> = [
    {
      label: 'Total émis',
      value: `${stats.totalMontantEmis.toFixed(2)} $`,
      icon: FaDollarSign,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Total payé',
      value: `${stats.totalPaye.toFixed(2)} $`,
      icon: FaCheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Total restant',
      value: `${stats.totalRestant.toFixed(2)} $`,
      icon: FaHourglassHalf,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
    {
      label: 'Nombre de factures',
      value: String(stats.totalFactures),
      icon: FaFileInvoice,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques de facturation"
        subtitle="Vue d&apos;ensemble des montants émis, payés et restants"
      />

      <PeriodeFilter value={filtre} onChange={setFiltre} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${card.bg} ${card.color}`}>
              <card.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200 lg:col-span-2">
          <Card.Header className="flex items-center justify-between">
            <span>Montants émis par mois</span>
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
              Total {stats.totalMontantEmis.toFixed(2)} $
            </span>
          </Card.Header>
          <Card.Body>
            {moisData.length === 0 ? (
              <p className="text-center text-gray-500 py-16">Aucune donnée mensuelle</p>
            ) : (
              <BarChart
                labels={moisData.map((m) => m.mois)}
                datasets={[{ label: 'Montant émis', data: moisData.map((m) => m.montant) }]}
                height={320}
                currency
              />
            )}
          </Card.Body>
        </Card>

        <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
          <Card.Header>Répartition par statut</Card.Header>
          <Card.Body>
            {statutLabels.length === 0 ? (
              <p className="text-center text-gray-500 py-16">Aucune donnée par statut</p>
            ) : (
              <DonutChart labels={statutLabels} datasets={[{ label: 'Factures', data: statutValues }]} height={320} />
            )}
          </Card.Body>
        </Card>
      </div>

      <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
        <Card.Header>Taux de recouvrement</Card.Header>
        <Card.Body>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Émis</p>
              <p className="mt-1 text-2xl font-bold text-slate-800">{stats.totalMontantEmis.toFixed(2)} $</p>
            </div>
            <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Encaissé</p>
              <p className="mt-1 text-2xl font-bold text-emerald-700">{totalEncaissement.toFixed(2)} $</p>
            </div>
            <div className="rounded-xl border border-rose-100 bg-rose-50 p-5 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Reste dû</p>
              <p className="mt-1 text-2xl font-bold text-rose-700">{stats.totalRestant.toFixed(2)} $</p>
            </div>
          </div>
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-600">Progression du recouvrement</span>
              <span className="font-semibold text-emerald-600">{tauxRecouvrement}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                style={{ width: `${Math.min(tauxRecouvrement, 100)}%` }}
              />
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
