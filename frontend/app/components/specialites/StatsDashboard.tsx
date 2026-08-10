// components/specialites/StatsDashboard.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { FaBuilding, FaCheckCircle, FaTimesCircle, FaUserMd, FaBed, FaChartBar } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import SkeletonCards from '@/app/ui/SkeletonCards';
import { specialiteService } from '@/app/services/specialiteService';
import type { StatistiquesSpecialites } from '@/app/types/specialite';

const StatsDashboard: React.FC = () => {
  const [stats, setStats] = useState<StatistiquesSpecialites | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await specialiteService.getStatistiques();
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
    return <SkeletonCards cards={4} />;
  }

  if (!stats) return null;

  const totalMedecins = stats.detailsParSpecialite.reduce(
    (acc, curr) => acc + curr.nombreMedecins,
    0
  );

  return (
    <div className="space-y-6">
      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 p-5 text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3">
              <FaBuilding className="text-2xl" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">{stats.totalSpecialites}</h3>
              <p className="text-sm opacity-90">Total spécialités</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3">
              <FaCheckCircle className="text-2xl" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">{stats.specialitesActives}</h3>
              <p className="text-sm opacity-90">Spécialités actives</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 p-5 text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3">
              <FaTimesCircle className="text-2xl" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">{stats.specialitesInactives}</h3>
              <p className="text-sm opacity-90">Spécialités inactives</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-5 text-white shadow-lg transition-transform hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-white/20 p-3">
              <FaUserMd className="text-2xl" />
            </div>
            <div>
              <h3 className="text-3xl font-bold">{totalMedecins}</h3>
              <p className="text-sm opacity-90">Médecins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Détails par spécialité */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaChartBar className="text-indigo-500" /> Détails par spécialité
          </h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.detailsParSpecialite.map((item, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-gray-50 p-4 transition-all hover:bg-white hover:shadow-md"
              >
                <h4 className="font-semibold text-gray-800">{item.specialite}</h4>
                <div className="mt-2 flex gap-4 text-sm">
                  <span className="flex items-center gap-1 text-indigo-600">
                    <FaUserMd /> {item.nombreMedecins} médecin{item.nombreMedecins > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1 text-purple-600">
                    <FaBed /> {item.nombreChambres} chambre{item.nombreChambres > 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsDashboard;
