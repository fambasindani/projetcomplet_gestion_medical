// components/medecins/MedecinStats.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { FaUserMd, FaCheckCircle, FaClock, FaTimesCircle, FaGraduationCap, FaChartBar, FaCalendarAlt, FaHospital, FaStethoscope, FaUsers } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { medecinService } from '@/app/services/medecinService';
import SkeletonCards from '@/app/ui/SkeletonCards';
import PageHeader from '@/app/ui/PageHeader';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import type { MedecinStats } from '@/app/types/medecin';

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

  return (
    <div className="space-y-6">
      <PageHeader title="Statistiques des médecins" />

      {/* Cartes stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <FaUserMd className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Total médecins</p>
              <p className="text-3xl font-bold">{stats.resume.totalMedecins}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-5 text-white shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <FaCheckCircle className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Médecins actifs</p>
              <p className="text-3xl font-bold">{stats.resume.medecinsActifs}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <FaChartBar className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Taux d&apos;activité</p>
              <p className="text-3xl font-bold">{stats.resume.tauxActivite}%</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl p-5 text-white shadow-lg transform transition hover:-translate-y-1 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="bg-white/20 p-3 rounded-xl">
              <FaCalendarAlt className="text-2xl" />
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Nouveaux (30j)</p>
              <p className="text-3xl font-bold">{stats.resume.medecinsRecents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tableau des spécialités */}
        <TableContainer>
          <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4">
            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaHospital className="text-indigo-500" /> Répartition par spécialité
            </h5>
          </div>
          <Table>
            <THead>
              <tr>
                <Th>Spécialité</Th>
                <Th align="center">Total</Th>
                <Th align="center">Disponibles</Th>
                <Th align="center">Congé</Th>
                <Th align="center">Absents</Th>
                <Th align="center">Formation</Th>
              </tr>
            </THead>
            <TBody>
              {stats.parSpecialite.map((spec, idx) => (
                <Tr key={idx}>
                  <Td className="whitespace-nowrap text-sm text-gray-900">{spec.specialite}</Td>
                  <Td className="whitespace-nowrap text-center text-sm font-semibold text-indigo-600">{spec.nombreMedecins}</Td>
                  <Td className="whitespace-nowrap text-center text-sm text-gray-600">{spec.disponibles}</Td>
                  <Td className="whitespace-nowrap text-center text-sm text-gray-600">{spec.enConge}</Td>
                  <Td className="whitespace-nowrap text-center text-sm text-gray-600">{spec.absents}</Td>
                  <Td className="whitespace-nowrap text-center text-sm text-gray-600">{spec.enFormation}</Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableContainer>

        {/* Répartition par disponibilité */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4">
            <h5 className="font-semibold text-gray-800 flex items-center gap-2">
              <FaUsers className="text-indigo-500" /> Répartition par disponibilité
            </h5>
          </div>
          <div className="p-6 space-y-4">
            {stats.parDisponibilite.map((item, idx) => {
              let icon, color;
              switch (item.disponibilite) {
                case 'Disponible':
                  icon = <FaCheckCircle className="text-green-500" />;
                  color = 'bg-green-500';
                  break;
                case 'En congé':
                  icon = <FaClock className="text-amber-500" />;
                  color = 'bg-amber-500';
                  break;
                case 'Absent':
                  icon = <FaTimesCircle className="text-red-500" />;
                  color = 'bg-red-500';
                  break;
                default:
                  icon = <FaGraduationCap className="text-blue-500" />;
                  color = 'bg-blue-500';
              }
              return (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      {icon}
                      <span className="font-medium text-gray-700">{item.disponibilite}</span>
                    </div>
                    <span className="font-bold text-gray-900">{item.nombre} ({item.pourcentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full ${color}`} style={{ width: `${item.pourcentage}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top médecins */}
      <TableContainer>
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4">
          <h5 className="font-semibold text-gray-800 flex items-center gap-2">
            <FaStethoscope className="text-indigo-500" /> Top 5 médecins les plus actifs
          </h5>
        </div>
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
              let badgeBg = '', badgeText = '';
              if (medecin.disponibilite === 'Disponible') {
                badgeBg = 'bg-green-100'; badgeText = 'text-green-800';
              } else if (medecin.disponibilite === 'En congé') {
                badgeBg = 'bg-amber-100'; badgeText = 'text-amber-800';
              } else if (medecin.disponibilite === 'Absent') {
                badgeBg = 'bg-red-100'; badgeText = 'text-red-800';
              } else {
                badgeBg = 'bg-blue-100'; badgeText = 'text-blue-800';
              }
              return (
                <Tr key={idx}>
                  <Td className="whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        {imageUrl ? (
                          <img src={imageUrl} alt={`${medecin.prenom} ${medecin.nom}`} className="w-full h-full object-cover" />
                        ) : (
                          <FaUserMd className="text-indigo-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Dr. {medecin.prenom} {medecin.nom}</p>
                        <p className="text-xs text-gray-500">{medecin.matricule}</p>
                      </div>
                    </div>
                  </Td>
                  <Td className="whitespace-nowrap text-sm text-gray-600">{medecin.specialite}</Td>
                  <Td className="whitespace-nowrap text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 font-semibold text-sm">
                      {medecin.nombreConsultations}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeBg} ${badgeText}`}>
                      {medecin.disponibilite}
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default MedecinStats;
