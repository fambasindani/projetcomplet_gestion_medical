'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaCalendarAlt, FaUserMd, FaStethoscope } from 'react-icons/fa';
import { Chart as ChartJS,  Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { consultationService } from '@/app/services/consultationService';
import { ConsultationStatsData } from '@/app/types/consultation';


ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const ConsultationStats: React.FC = () => {
  const router = useRouter();
  const [stats, setStats] = useState<ConsultationStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await consultationService.getStats();
        setStats(data);
      } catch (error) {
        console.error(error);
        toast.error('Erreur lors du chargement des statistiques');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <SkeletonCards cards={3} />;
  if (!stats) return <div className="p-6 text-center text-red-600">Impossible de charger les statistiques</div>;

  // Graphique par médecin (top 5)
  const medecinLabels = stats.topMedecins.map(m => `${m.nom} ${m.prenom}`);
  const medecinData = stats.topMedecins.map(m => m.nombreConsultations);

  const medecinChartData = {
    labels: medecinLabels,
    datasets: [{ label: 'Consultations', data: medecinData, backgroundColor: '#667eea' }],
  };

  // Graphique par mois (6 derniers mois)
  const moisLabels = stats.parMois.map(m => m.mois);
  const moisData = stats.parMois.map(m => m.nombre);

  const moisChartData = {
    labels: moisLabels,
    datasets: [{ label: 'Consultations', data: moisData, backgroundColor: '#10b981' }],
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistiques des consultations"
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.back()}>
            Retour
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
          <FaStethoscope className="mx-auto mb-3 text-4xl text-indigo-500" />
          <h3 className="text-3xl font-bold">{stats.totalConsultations}</h3>
          <p className="text-gray-500">Total consultations</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
          <FaCalendarAlt className="mx-auto mb-3 text-4xl text-blue-500" />
          <h3 className="text-3xl font-bold">{stats.consultationsMois}</h3>
          <p className="text-gray-500">Ce mois-ci</p>
        </div>
        <div className="rounded-2xl bg-white p-6 text-center shadow-sm ring-1 ring-gray-100">
          <FaUserMd className="mx-auto mb-3 text-4xl text-purple-500" />
          <h3 className="text-3xl font-bold">{stats.medecinsActifs}</h3>
          <p className="text-gray-500">Médecins actifs</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
            <h5 className="font-semibold text-gray-800">Top 5 médecins</h5>
          </div>
          <div className="h-80 p-4">
            <Bar data={medecinChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b">
            <h5 className="font-semibold text-gray-800">Évolution mensuelle</h5>
          </div>
          <div className="h-80 p-4">
            <Bar data={moisChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultationStats;
