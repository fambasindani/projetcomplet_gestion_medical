'use client';

import React, { useEffect, useState } from 'react';
import { FaUsers, FaCalendarAlt, FaVenusMars, FaUserPlus, FaTint, FaHeart } from 'react-icons/fa';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { toast } from 'react-hot-toast';

import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import type { PatientStats } from '@/app/types/patient';
import { patientService } from '@/app/services/patientService';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const GENRE_LABELS: Record<string, string> = { M: 'Masculin', F: 'Féminin' };

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

  const genreChartData = {
    labels: genreLabels,
    datasets: [{
      data: stats.parGenre.map(g => g.nombre),
      backgroundColor: PALETTE,
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const groupeSanguinChartData = {
    labels: stats.parGroupeSanguin.map(g => g.groupeSanguin),
    datasets: [{
      data: stats.parGroupeSanguin.map(g => g.nombre),
      backgroundColor: stats.parGroupeSanguin.map((_, i) => PALETTE[i % PALETTE.length]),
      borderRadius: 8,
      maxBarThickness: 42,
    }],
  };

  const situationFamilialeChartData = {
    labels: stats.parSituationFamiliale.map(s => s.situationFamiliale),
    datasets: [{
      data: stats.parSituationFamiliale.map(s => s.nombre),
      backgroundColor: stats.parSituationFamiliale.map((_, i) => PALETTE[i % PALETTE.length]),
      borderRadius: 8,
      maxBarThickness: 42,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1f2937',
        padding: 12,
        cornerRadius: 10,
        titleFont: { weight: 'bold' as const },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#6b7280', font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: { color: '#6b7280', font: { size: 11 }, precision: 0 },
      },
    },
  };

  const horizontalBarOptions = {
    ...barOptions,
    indexAxis: 'y' as const,
  };

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques patients"
        subtitle="Vue d'ensemble de la population de patients de l'hôpital"
      />

      {/* KPI */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 right-10 h-20 w-20 rounded-full bg-white/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Total patients</p>
              <p className="mt-1 text-4xl font-bold">{stats.totalPatients}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <FaUsers className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <FaUserPlus className="text-sm" /> +{stats.patientsRecents} ce mois-ci
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 right-10 h-20 w-20 rounded-full bg-white/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Nouveaux patients</p>
              <p className="mt-1 text-4xl font-bold">{stats.patientsRecents}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <FaCalendarAlt className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <FaUserPlus className="text-sm" /> Sur les 30 derniers jours
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 p-6 text-white shadow-lg">
          <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
          <div className="absolute -bottom-8 right-10 h-20 w-20 rounded-full bg-white/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Genre réparti</p>
              <p className="mt-1 text-4xl font-bold">{genreTotal}</p>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
              <FaVenusMars className="text-2xl" />
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <FaUserPlus className="text-sm" /> {genreLabels[0] || '—'} {genreLabels[1] ? `• ${genreLabels[1]}` : ''}
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
            <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaVenusMars className="text-indigo-500" /> Répartition par genre</h5>
          </div>
          <div className="relative h-80 p-4">
            <Pie data={genreChartData} options={{
              responsive: true,
              maintainAspectRatio: false,
              cutout: '62%',
              plugins: {
                legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, font: { size: 12 } } },
                tooltip: { backgroundColor: '#1f2937', padding: 12, cornerRadius: 10 },
              },
            }} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-800">{genreTotal}</span>
              <span className="text-xs font-medium text-gray-400 uppercase">Patients</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
            <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaTint className="text-red-400" /> Groupe sanguin</h5>
          </div>
          <div className="h-80 p-4">
            <Bar data={groupeSanguinChartData} options={barOptions} />
          </div>
        </div>

        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
            <h5 className="font-semibold text-gray-800 flex items-center gap-2"><FaHeart className="text-pink-500" /> Situation familiale</h5>
          </div>
          <div className="h-80 p-4">
            <Bar data={situationFamilialeChartData} options={horizontalBarOptions} />
          </div>
        </div>
      </div>

      {/* Répartition détaillée */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {[
          { title: 'Par genre', icon: <FaVenusMars className="text-indigo-500" />, items: breakdown('genre') },
          { title: 'Par groupe sanguin', icon: <FaTint className="text-red-400" />, items: breakdown('sang') },
          { title: 'Par situation familiale', icon: <FaHeart className="text-pink-500" />, items: breakdown('famille') },
        ].map((section) => (
          <div key={section.title} className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
              <h5 className="font-semibold text-gray-800 flex items-center gap-2">{section.icon} {section.title}</h5>
            </div>
            <div className="p-5 space-y-4">
              {section.items.map((item, i) => {
                const pct = section.items.reduce((acc, it) => acc + it.value, 0) > 0
                  ? Math.round((item.value / section.items.reduce((acc, it) => acc + it.value, 0)) * 100)
                  : 0;
                return (
                  <div key={i}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">{item.name || 'Non précisé'}</span>
                      <span className="font-semibold text-gray-900">{item.value} <span className="text-xs font-normal text-gray-400">({pct}%)</span></span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientStats;
