// components/medecins/MedecinStats.tsx
'use client';

import React, { useEffect, useState } from 'react';
import {
  FaUserMd, FaCheckCircle, FaClock, FaTimesCircle, FaGraduationCap,
  FaChartBar, FaCalendarAlt, FaHospital, FaStethoscope, FaUsers,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { medecinService } from '@/app/services/medecinService';
import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import Card from '@/app/components/common/Card';
import { DonutChart } from '@/app/ui/Charts';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import type { MedecinStats } from '@/app/types/medecin';

const STAT_COLORS: Record<string, string> = {
  Disponible: '#10b981',
  'En congé': '#facc15',
  EnConge: '#facc15',
  Absent: '#7c3aed',
  'En formation': '#ec4899',
  EnFormation: '#ec4899',
};

const STAT_HEX: Record<string, string> = {
  Disponible: 'bg-emerald-500',
  'En congé': 'bg-yellow-400',
  EnConge: 'bg-yellow-400',
  Absent: 'bg-violet-600',
  'En formation': 'bg-pink-500',
  EnFormation: 'bg-pink-500',
};

// Libellés lisibles pour les valeurs brutes du backend (EnConge, EnFormation…)
const STAT_LABELS: Record<string, string> = {
  Disponible: 'Disponible',
  'En congé': 'En congé',
  EnConge: 'En congé',
  Absent: 'Absent',
  'En formation': 'En formation',
  EnFormation: 'En formation',
};

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = API_URL?.replace('/api', '') || 'http://localhost:7034';

const getImageUrl = (photo: string | null | undefined): string | null => {
  if (!photo) return null;
  if (photo.startsWith('/uploads')) return `${BASE_URL}${photo}`;
  return photo;
};

const MedecinStats: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<MedecinStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await medecinService.getStatistiques();
        setStats(data);
      } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <SkeletonCards cards={4} />;
  }

  if (!stats) return null;

  const kpis = [
    { label: 'Total médecins', value: stats.resume.totalMedecins, icon: FaUserMd, color: '#6366f1' },
    { label: 'Médecins actifs', value: stats.resume.medecinsActifs, icon: FaCheckCircle, color: '#10b981' },
    { label: "Taux d'activité", value: `${stats.resume.tauxActivite}%`, icon: FaChartBar, color: '#f59e0b' },
    { label: 'Nouveaux (30j)', value: stats.resume.medecinsRecents, icon: FaCalendarAlt, color: '#f43f5e' },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Statistiques des médecins" />

      {/* KPI cards (fond blanc) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      {/* Disponibilité (donut) + spécialités */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="rounded-xl shadow-sm ring-1 ring-slate-200/70 lg:col-span-1">
          <Card.Header className="border-b border-slate-100 text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-2"><FaUsers className="text-indigo-500" /> Disponibilité</span>
          </Card.Header>
          <Card.Body>
            {stats.parDisponibilite.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-400">Aucune donnée</p>
            ) : (
              <DonutChart
                labels={stats.parDisponibilite.map((d) => STAT_LABELS[d.disponibilite] ?? d.disponibilite)}
                datasets={[{
                  label: 'Médecins',
                  data: stats.parDisponibilite.map((d) => d.nombre),
                }]}
                colors={stats.parDisponibilite.map((d) => STAT_COLORS[d.disponibilite] ?? '#94a3b8')}
                height={260}
              />
            )}
            <div className="mt-4 space-y-3">
              {stats.parDisponibilite.map((item) => (
                <div key={item.disponibilite}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium text-slate-600">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{ background: STAT_COLORS[item.disponibilite] ?? '#94a3b8' }}
                      />
                      {STAT_LABELS[item.disponibilite] ?? item.disponibilite}
                    </span>
                    <span className="font-semibold tabular-nums text-slate-700">
                      {item.nombre} <span className="text-slate-400">({item.pourcentage}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${STAT_HEX[item.disponibilite] ?? 'bg-slate-400'}`}
                      style={{ width: `${item.pourcentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>

        <Card className="overflow-hidden rounded-xl shadow-sm ring-1 ring-slate-200/70 lg:col-span-2">
          <Card.Header className="border-b border-slate-100 bg-slate-50 text-sm font-semibold text-slate-700">
            <span className="flex items-center gap-2"><FaHospital className="text-indigo-500" /> Répartition par spécialité</span>
          </Card.Header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-2.5">Spécialité</th>
                  <th className="px-4 py-2.5 text-center">Total</th>
                  <th className="px-4 py-2.5 text-center">Disponibles</th>
                  <th className="px-4 py-2.5 text-center">Congé</th>
                  <th className="px-4 py-2.5 text-center">Absents</th>
                  <th className="px-4 py-2.5 text-center">Formation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.parSpecialite.map((spec) => (
                  <tr key={spec.specialite} className="transition hover:bg-slate-50/70">
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-slate-700">{spec.specialite}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center font-semibold tabular-nums text-indigo-600">{spec.nombreMedecins}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center tabular-nums text-emerald-600">{spec.disponibles}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center tabular-nums text-amber-600">{spec.enConge}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center tabular-nums text-rose-600">{spec.absents}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-center tabular-nums text-sky-600">{spec.enFormation}</td>
                  </tr>
                ))}
                {stats.parSpecialite.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-400">Aucune donnée</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Top médecins */}
      <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200/70">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <FaStethoscope className="text-indigo-500" /> Top 5 médecins les plus actifs
          </h5>
          <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
            {stats.topMedecins.length}
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <THead>
              <tr>
                <Th>Médecin</Th>
                <Th>Spécialité</Th>
                <Th align="center">Consultations</Th>
                <Th align="center">Disponibilité</Th>
              </tr>
            </THead>
            <TBody>
              {stats.topMedecins.map((medecin, idx) => {
                const imageUrl = getImageUrl(medecin.photo);
                const color = STAT_COLORS[medecin.disponibilite] ?? '#0ea5e9';
                return (
                  <Tr key={idx}>
                    <Td className="whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 overflow-hidden rounded-full bg-slate-100 flex items-center justify-center">
                          {imageUrl ? (
                            <img src={imageUrl} alt={`${medecin.prenom} ${medecin.nom}`} className="h-full w-full object-cover" />
                          ) : (
                            <FaUserMd className="text-slate-400" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">Dr. {medecin.prenom} {medecin.nom}</p>
                          <p className="text-xs text-slate-400">{medecin.matricule}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="whitespace-nowrap text-sm text-slate-600">{medecin.specialite}</Td>
                    <Td className="whitespace-nowrap text-center">
                      <span className="inline-flex items-center justify-center rounded-md bg-indigo-50 px-2.5 py-1 text-sm font-semibold tabular-nums text-indigo-700">
                        {medecin.nombreConsultations}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-center">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
                        style={{ background: `${color}14`, color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
                        {STAT_LABELS[medecin.disponibilite] ?? medecin.disponibilite}
                      </span>
                    </Td>
                  </Tr>
                );
              })}
              {stats.topMedecins.length === 0 && (
                <Tr><Td colSpan={4} className="py-10 text-center text-slate-400">Aucune donnée</Td></Tr>
              )}
            </TBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MedecinStats;
