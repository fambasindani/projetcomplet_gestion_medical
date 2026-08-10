'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaArrowLeft, FaChartLine, FaPills, FaBoxes, FaDollarSign, FaCalendar } from 'react-icons/fa';
import { delivranceService } from '@/app/services/delivranceService';
import type { DelivranceStatistiques } from '@/app/types/delivrance';
import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';

export default function DelivranceStatistique() {
  const router = useRouter();
  const [stats, setStats] = useState<DelivranceStatistiques | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    delivranceService.getStatistiques()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <SkeletonCards cards={3} />;
  if (!stats) return (
    <EmptyState
      icon={<FaChartLine />}
      title="Aucune donnée statistique disponible"
      description="Les statistiques seront affichées dès que des délivrances seront enregistrées."
    />
  );

  const cards = [
    { label: 'Total délivrances', value: stats.totalDelivrances, icon: FaPills, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Délivrances ce mois', value: stats.delivrancesCeMois, icon: FaCalendar, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Montant total', value: `${stats.montantTotal.toFixed(2)} $`, icon: FaDollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tableau de bord"
        subtitle="Analyse détaillée de vos activités de délivrance"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.back()}>
            Retour
          </Button>
        }
      />

      {/* Cartes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, idx) => (
          <div key={idx} className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <div className={`p-4 rounded-2xl ${card.bg} ${card.color}`}>
              <card.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Top Médicaments */}
      {stats.topMedicaments?.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
            <FaBoxes className="text-indigo-600" /> Top médicaments délivrés
          </h2>
          <div className="space-y-4">
            {stats.topMedicaments.map((med, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                <span className="font-medium text-gray-700">{med.nom}</span>
                <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm font-bold text-indigo-600">
                  {med.quantiteTotale} unités
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
