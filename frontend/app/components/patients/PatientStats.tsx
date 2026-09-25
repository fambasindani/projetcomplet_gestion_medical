'use client';

import React, { useEffect, useState } from 'react';
import { FaUsers, FaCalendarAlt, FaVenusMars, FaUserPlus, FaTint, FaHeart } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import { BarChart, DonutChart } from '@/app/ui/Charts';
import type { PatientStats } from '@/app/types/patient';
import { patientService } from '@/app/services/patientService';

const GENRE_LABELS: Record<string, string> = { M: 'Masculin', F: 'Féminin' };

// Couleurs distinctes et stables par genre
const GENRE_COLORS: Record<string, string> = {
  M: '#3b82f6',
  F: '#ec4899',
  Autre: '#8b5cf6',
  'Non précisé': '#94a3b8',
};

const PALETTE = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#0ea5e9', '#14b8a6', '#f97316'];

const PatientStats: React.FC = () => {
  const [stats, setStats] = useState<PatientStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await patientService.getStatistiques();
        setStats(data);
      } catch (error) {
        console.error('Erreur chargement stats:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <SkeletonCards cards={6} />;
  }

  if (!stats) return null;

  const genreTotal = stats.parGenre.reduce((acc, g) => acc + g.nombre, 0);
  const genreLabels = stats.parGenre.map(g => GENRE_LABELS[g.genre] || g.genre);

  const breakdown = (label: string) =>
    label === 'genre' ? stats.parGenre.map((g, i) => ({
      name: GENRE_LABELS[g.genre] || g.genre,
      value: g.nombre,
      color: PALETTE[i % PALETTE.length],
    })) : label === 'sang' ? stats.parGroupeSanguin.map((g, i) => ({
      name: g.groupeSanguin,
      value: g.nombre,
      color: PALETTE[i % PALETTE.length],
    })) : stats.parSituationFamiliale.map((s, i) => ({
      name: s.situationFamiliale,
      value: s.nombre,
      color: PALETTE[i % PALETTE.length],
    }));

  const kpis = [
    { label: 'Total patients', value: stats.totalPatients, icon: FaUsers, color: '#6366f1', sub: `+${stats.patientsRecents} ce mois-ci` },
    { label: 'Nouveaux patients', value: stats.patientsRecents, icon: FaCalendarAlt, color: '#10b981', sub: '30 derniers jours' },
    { label: 'Genre réparti', value: genreTotal, icon: FaVenusMars, color: '#f59e0b', sub: genreLabels.join(' • ') },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Statistiques patients"
        subtitle="Vue d'ensemble de la population de patients de l'hôpital"
      />

      {/* KPI cards (fond blanc) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300"
          >
            <span className="absolute inset-y-0 left-0 w-1" style={{ background: kpi.color }} />
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{kpi.label}</p>
                <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{kpi.value}</div>
                {kpi.sub && <p className="mt-1 text-xs text-slate-400">{kpi.sub}</p>}
              </div>
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                style={{ background: `${kpi.color}14`, color: kpi.color }}
              >
                <kpi.icon className="text-base" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Panel title="Répartition par genre" icon={<FaVenusMars className="text-indigo-500" />}>
          <DonutChart
            labels={genreLabels}
            datasets={[{ label: 'Patients', data: stats.parGenre.map((g) => g.nombre) }]}
            colors={stats.parGenre.map((g) => GENRE_COLORS[g.genre] ?? '#94a3b8')}
            height={280}
          />
        </Panel>

        <Panel title="Groupe sanguin" icon={<FaTint className="text-rose-400" />}>
          {stats.parGroupeSanguin.length === 0 ? (
            <Empty text="Aucune donnée" />
          ) : (
            <BarChart
              labels={stats.parGroupeSanguin.map((g) => g.groupeSanguin)}
              datasets={[{ label: 'Patients', data: stats.parGroupeSanguin.map((g) => g.nombre) }]}
              height={280}
            />
          )}
        </Panel>

        <Panel title="Situation familiale" icon={<FaHeart className="text-pink-500" />}>
          {stats.parSituationFamiliale.length === 0 ? (
            <Empty text="Aucune donnée" />
          ) : (
            <BarChart
              labels={stats.parSituationFamiliale.map((s) => s.situationFamiliale)}
              datasets={[{ label: 'Patients', data: stats.parSituationFamiliale.map((s) => s.nombre) }]}
              height={280}
            />
          )}
        </Panel>
      </div>

      {/* Répartition détaillée */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {[
          { title: 'Par genre', icon: <FaVenusMars className="text-indigo-500" />, items: breakdown('genre') },
          { title: 'Par groupe sanguin', icon: <FaTint className="text-rose-400" />, items: breakdown('sang') },
          { title: 'Par situation familiale', icon: <FaHeart className="text-pink-500" />, items: breakdown('famille') },
        ].map((section) => (
          <Panel key={section.title} title={section.title} icon={section.icon}>
            <div className="space-y-3.5">
              {section.items.map((item, i) => {
                const total = section.items.reduce((acc, it) => acc + it.value, 0);
                const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                return (
                  <div key={i}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 font-medium text-slate-600">
                        <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: item.color }} />
                        {item.name || 'Non précisé'}
                      </span>
                      <span className="font-semibold tabular-nums text-slate-700">
                        {item.value} <span className="font-normal text-slate-400">({pct}%)</span>
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
};

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
        <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-700">{icon} {title}</h5>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-16 text-center text-sm text-slate-400">{text}</p>;
};

export default PatientStats;
