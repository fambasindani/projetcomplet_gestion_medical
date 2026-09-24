'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
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

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#6b7280'];

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

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await factureService.getStatistiques();
      setStats(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  if (loading) return <SkeletonCards cards={4} />;
  if (!stats) {
    return <div className="p-12 text-center text-gray-500">Aucune donnée statistique disponible.</div>;
  }

  const moisData = stats.parMois.map((item) => ({
    mois: formatMois(item.mois),
    montant: item.montant,
    nombre: item.nombre,
  }));

  const statutData = stats.parStatut.map((item) => ({
    name: StatutFactureLabels[item.statut],
    value: item.nombre,
  }));

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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
          <Card.Header>Montants émis par mois</Card.Header>
          <Card.Body>
            {moisData.length === 0 ? (
              <p className="text-center text-gray-500 py-16">Aucune donnée mensuelle</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moisData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mois" />
                    <YAxis tickFormatter={(value: number) => value.toLocaleString('fr-FR')} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="montant" name="Montant émis" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="rounded-2xl shadow-sm ring-1 ring-slate-200">
          <Card.Header>Répartition par statut</Card.Header>
          <Card.Body>
            {statutData.length === 0 ? (
              <p className="text-center text-gray-500 py-16">Aucune donnée par statut</p>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statutData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
                      label
                    >
                      {statutData.map((entry, index) => (
                        <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
