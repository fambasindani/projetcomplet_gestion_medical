'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaUserInjured, FaUserMd, FaCalendarCheck, FaExclamationTriangle,
  FaPills, FaStethoscope, FaArrowRight, FaClock, FaHospital, FaUserPlus
} from 'react-icons/fa';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { toast } from 'react-hot-toast';
import Card from '../components/common/Card';
import SkeletonCards from '../ui/SkeletonCards';
import { patientService } from '../services/patientService';
import { medecinService } from '../services/medecinService';
import { planningService } from '../services/planningService';
import { rendezvousService } from '../services/rendezvousService';
import { consultationService } from '../services/consultationService';
import { alerteStockService } from '../services/alerteStockService';
import type { RendezVous } from '../types/rendezvous';
import type { AlerteStock } from '../types/alerte';

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];

interface DashboardData {
  totalPatients: number;
  patientsRecents: number;
  totalMedecins: number;
  rdvAujourdhui: number;
  alertesNonTraitees: number;
  consultationsMois: number;
  parMois: { mois: string; nombre: number }[];
  parSpecialite: { specialite: string; nombreMedecins: number }[];
  rdvDuJour: RendezVous[];
  alertes: AlerteStock[];
}

const emptyData: DashboardData = {
  totalPatients: 0,
  patientsRecents: 0,
  totalMedecins: 0,
  rdvAujourdhui: 0,
  alertesNonTraitees: 0,
  consultationsMois: 0,
  parMois: [],
  parSpecialite: [],
  rdvDuJour: [],
  alertes: [],
};

const AlerteTypeLabels: Record<string, string> = {
  STOCK_FAIBLE: 'Stock faible',
  STOCK_CRITIQUE: 'Stock critique',
  PEREMPTION_PROCHAINE: 'Péremption prochaine',
  PEREMPTION_DEPASSEE: 'Péremption dépassée',
};

const Dashboard = () => {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [patientStats, medecinStats, consultationStats, rdvStats, rdvDuJourRes, alertesRes] = await Promise.allSettled([
        patientService.getStatistiques(),
        medecinService.getStatistiques(),
        consultationService.getStats(),
        planningService.getStats(),
        rendezvousService.getPlanningJournalier(new Date()),
        alerteStockService.search({ traitee: false, pageSize: 5 }),
      ]);

      const patientVal = patientStats.status === 'fulfilled' ? patientStats.value : null;
      const medecinVal = medecinStats.status === 'fulfilled' ? medecinStats.value : null;
      const consultationVal = consultationStats.status === 'fulfilled' ? consultationStats.value : null;
      const rdvStatsVal = rdvStats.status === 'fulfilled' ? rdvStats.value : null;
      const rdvDuJourVal = rdvDuJourRes.status === 'fulfilled' ? rdvDuJourRes.value : null;
      const alertesVal = alertesRes.status === 'fulfilled' ? alertesRes.value : null;

      setData({
        totalPatients: patientVal?.totalPatients ?? 0,
        patientsRecents: patientVal?.patientsRecents ?? 0,
        totalMedecins: medecinVal?.resume.totalMedecins ?? 0,
        rdvAujourdhui: rdvStatsVal?.aujourdhui ?? 0,
        alertesNonTraitees: alertesVal?.totalCount ?? 0,
        consultationsMois: consultationVal?.consultationsMois ?? 0,
        parMois: consultationVal?.parMois ?? [],
        parSpecialite: (medecinVal?.parSpecialite ?? []).map(s => ({
          specialite: s.specialite || 'Non précisée',
          nombreMedecins: s.nombreMedecins,
        })),
        rdvDuJour: rdvDuJourVal ?? [],
        alertes: alertesVal?.items ?? [],
      });

      const hasErrors = [patientStats, medecinStats, consultationStats, rdvStats, rdvDuJourRes, alertesRes]
        .some(r => r.status === 'rejected');
      if (hasErrors) {
        toast.error('Certaines données du tableau de bord n\'ont pas pu être chargées');
      }
    } catch {
      toast.error('Erreur lors du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  if (loading) {
    return <SkeletonCards cards={4} />;
  }

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const statsCards = [
    { title: 'Patients', value: data.totalPatients, sub: `${data.patientsRecents} nouveaux (30j)`, icon: FaUserInjured, color: '#6366f1', href: '/patients' },
    { title: 'Médecins', value: data.totalMedecins, sub: 'Médecins inscrits', icon: FaUserMd, color: '#8b5cf6', href: '/medecins' },
    { title: 'Rendez-vous du jour', value: data.rdvAujourdhui, sub: 'Aujourd\'hui', icon: FaCalendarCheck, color: '#10b981', href: '/rendezvous' },
    { title: 'Alertes stock', value: data.alertesNonTraitees, sub: 'Non traitées', icon: FaExclamationTriangle, color: '#ef4444', href: '/pharmacie/alertes' },
  ];

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-8 text-white shadow-xl shadow-indigo-200"
      >
        <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-20 right-24 h-48 w-48 rounded-full bg-fuchsia-400/20 blur-3xl" />
        <div className="absolute right-10 top-6 hidden items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm backdrop-blur md:flex">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Système opérationnel
        </div>
        <div className="relative">
          <p className="text-sm font-medium uppercase tracking-widest text-indigo-200">Centre hospitalier</p>
          <h1 className="mt-1 text-3xl font-bold">Tableau de bord</h1>
          <p className="mt-1 text-indigo-200 capitalize">{dateLabel}</p>
        </div>
      </motion.div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08, duration: 0.4 }}
            className="group"
          >
            <Link href={card.href} className="block">
              <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                <div className="absolute right-0 top-0 h-24 w-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20" style={{ background: card.color }} />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{card.title}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{card.sub}</p>
                  </div>
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
                    style={{ background: `linear-gradient(135deg, ${card.color}, ${card.color}99)` }}
                  >
                    <card.icon className="text-xl" />
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card className="h-full rounded-2xl shadow-sm ring-1 ring-gray-100">
            <Card.Header className="flex items-center justify-between border-gray-100">
              <span className="flex items-center gap-2 text-gray-800"><FaStethoscope className="text-indigo-500" /> Évolution des consultations</span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                {data.consultationsMois} ce mois-ci
              </span>
            </Card.Header>
            <Card.Body>
              {data.parMois.length === 0 || data.parMois.every(m => m.nombre === 0) ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <FaStethoscope className="text-4xl text-gray-200" />
                  <p className="text-sm text-gray-400">Aucune consultation enregistrée</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.parMois} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorConsultations" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.5} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="mois" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '13px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Area type="monotone" dataKey="nombre" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorConsultations)" name="Consultations" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full rounded-2xl shadow-sm ring-1 ring-gray-100">
            <Card.Header className="flex items-center justify-between border-gray-100">
              <span className="flex items-center gap-2 text-gray-800"><FaHospital className="text-purple-500" /> Médecins par spécialité</span>
            </Card.Header>
            <Card.Body>
              {data.parSpecialite.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-16 text-center">
                  <FaUserMd className="text-4xl text-gray-200" />
                  <p className="text-sm text-gray-400">Aucune donnée de spécialité disponible</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.parSpecialite}
                      cx="50%" cy="50%" innerRadius={60} outerRadius={95}
                      paddingAngle={4} cornerRadius={6}
                      dataKey="nombreMedecins" nameKey="specialite"
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      labelLine={{ stroke: '#cbd5e1' }}
                    >
                      {data.parSpecialite.map((_, idx) => <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '13px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </motion.div>
      </div>

      {/* Activities & Appointments */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <Card className="h-full rounded-2xl shadow-sm ring-1 ring-gray-100">
            <Card.Header className="flex items-center justify-between border-gray-100">
              <span className="flex items-center gap-2 text-gray-800"><FaExclamationTriangle className="text-amber-500" /> Alertes stock récentes</span>
              {data.alertes.length > 0 && (
                <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                  {data.alertesNonTraitees} non traitées
                </span>
              )}
            </Card.Header>
            <Card.Body>
              {data.alertes.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <FaPills className="text-4xl text-emerald-200" />
                  <p className="text-sm text-gray-400">Aucune alerte stock en cours</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.alertes.map(a => (
                    <div key={a.idAlerte} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-md shadow-rose-200">
                        <FaExclamationTriangle className="text-sm" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-800">{a.medicamentNom}</p>
                        <p className="text-xs text-gray-500">{AlerteTypeLabels[a.typeAlerte] ?? a.typeAlerte}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">Urgent</span>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
          <Card className="h-full rounded-2xl shadow-sm ring-1 ring-gray-100">
            <Card.Header className="flex items-center justify-between border-gray-100">
              <span className="flex items-center gap-2 text-gray-800"><FaCalendarCheck className="text-emerald-500" /> Rendez-vous du jour</span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">{data.rdvAujourdhui} au total</span>
            </Card.Header>
            <Card.Body>
              {data.rdvDuJour.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-10 text-center">
                  <FaClock className="text-4xl text-gray-200" />
                  <p className="text-sm text-gray-400">Aucun rendez-vous aujourd&apos;hui</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.rdvDuJour.map(rdv => {
                    const time = rdv.dateRdv ? new Date(rdv.dateRdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
                    return (
                      <div key={rdv.idRdv} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/50 p-3 transition-colors hover:bg-gray-50">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-200">
                            <FaUserPlus className="text-sm" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-gray-800">{rdv.medecinPrenom} {rdv.medecinNom}</p>
                            <p className="truncate text-xs text-gray-500">
                              {rdv.patientPrenom} {rdv.patientNom} {rdv.medecinSpecialite ? ` • ${rdv.medecinSpecialite}` : ''}
                            </p>
                          </div>
                        </div>
                        <span className="ml-2 shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">{time}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="mt-4 text-right">
                <Link href="/rendezvous" className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 transition-colors hover:text-emerald-800">
                  Voir tous les rendez-vous <FaArrowRight size={12} />
                </Link>
              </div>
            </Card.Body>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
