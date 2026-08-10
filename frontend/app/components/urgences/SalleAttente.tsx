'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FaUserInjured, FaCheckCircle, FaTimes, FaStethoscope, FaHospital } from 'react-icons/fa';
import SkeletonCards from '@/app/ui/SkeletonCards';
import { urgenceService } from '@/app/services/urgenceService';
import type { AdmissionUrgence, GraviteUrgence } from '@/app/types/urgence';
import { GraviteUrgenceLabels, StatutAdmissionUrgence } from '@/app/types/urgence';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const graviteStyle: Record<GraviteUrgence, { badge: string; bar: string; label: string }> = {
  Critique: { badge: 'bg-red-100 text-red-700', bar: 'bg-red-500', label: 'CRITIQUE' },
  Urgente: { badge: 'bg-orange-100 text-orange-700', bar: 'bg-orange-500', label: 'URGENTE' },
  Semi_urgente: { badge: 'bg-yellow-100 text-yellow-700', bar: 'bg-yellow-500', label: 'SEMI-URGENTE' },
  Non_urgente: { badge: 'bg-emerald-100 text-emerald-700', bar: 'bg-emerald-500', label: 'NON URGENTE' },
};

const graviteOrder: Record<GraviteUrgence, number> = { Critique: 0, Urgente: 1, Semi_urgente: 2, Non_urgente: 3 };

const tempsAttente = (dateArrivee: string): string => {
  const diff = Math.max(0, Date.now() - new Date(dateArrivee).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}` : `${h}h`;
};

export default function SalleAttente() {
  const router = useRouter();
  const [items, setItems] = useState<AdmissionUrgence[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const list = await urgenceService.getSalleAttente();
      setItems(list);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  const changerStatut = async (id: number, statut: StatutAdmissionUrgence) => {
    try {
      await urgenceService.changerStatutAdmission(id, statut);
      toast.success(statut === StatutAdmissionUrgence.En_consultation
        ? 'Patient pris en charge'
        : statut === StatutAdmissionUrgence.Sorti
          ? 'Patient sorti'
          : 'Statut mis à jour');
      await loadData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonCards cards={4} />;

  const sorted = [...items].sort((a, b) => graviteOrder[a.gravite] - graviteOrder[b.gravite] || new Date(a.dateArrivee).getTime() - new Date(b.dateArrivee).getTime());
  const compteurs = Object.keys(graviteStyle).map((g) => ({
    gravite: g as GraviteUrgence,
    count: items.filter((i) => i.gravite === g).length,
  }));

  return (
    <div className="min-h-screen space-y-6 p-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-500 p-6 text-white shadow-lg">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-bold">Salle d&apos;attente des urgences</h1>
            <p className="text-sm text-red-100">{items.length} patient(s) en attente</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {compteurs.map((c) => (
              <div key={c.gravite} className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm backdrop-blur">
                <span className={`h-2.5 w-2.5 rounded-full ${graviteStyle[c.gravite].bar}`} />
                {GraviteUrgenceLabels[c.gravite]} : <strong>{c.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <FaCheckCircle className="text-2xl" />
          </div>
          <p className="text-lg font-semibold text-gray-600">Aucun patient en attente</p>
          <p className="text-sm text-gray-400">La salle d&apos;attente est vide</p>
          <button
            onClick={() => router.push('/urgences/admissions')}
            className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            <FaUserInjured /> Enregistrer une admission
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((adm, idx) => {
            const g = graviteStyle[adm.gravite];
            const patient = `${adm.patientPrenom ?? ''} ${adm.patientNom ?? ''}`.trim() || `Patient #${adm.idPatient}`;
            return (
              <motion.div
                key={adm.idAdmissionUrgence}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100"
              >
                <div className={`h-1.5 ${g.bar}`} />
                <div className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
                  <div className="flex items-center gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${g.badge}`}>
                      <FaUserInjured className="text-xl" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-gray-900">{patient}</h3>
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${g.badge}`}>{g.label}</span>
                      </div>
                      <p className="truncate text-sm text-gray-500">{adm.motifUrgent}</p>
                    </div>
                  </div>
                  <div className="grid flex-1 grid-cols-2 gap-3 text-sm md:grid-cols-4 md:pl-4">
                    <div>
                      <p className="text-xs text-gray-400">Attente</p>
                      <p className="font-semibold text-gray-700">{tempsAttente(adm.dateArrivee)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">N° admission</p>
                      <p className="font-mono text-xs font-semibold text-gray-700">{adm.numeroAdmission}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Arrivée</p>
                      <p className="font-semibold text-gray-700">{new Date(adm.dateArrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Constantes</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {adm.tensionArterielle ? `TA ${adm.tensionArterielle}` : '—'}
                        {adm.pouls ? ` · ${adm.pouls} bpm` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={() => changerStatut(adm.idAdmissionUrgence, StatutAdmissionUrgence.En_consultation)}
                      className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700"
                    >
                      <FaStethoscope /> Prendre en charge
                    </button>
                    <button
                      onClick={() => changerStatut(adm.idAdmissionUrgence, StatutAdmissionUrgence.Sorti)}
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
                      title="Marquer sorti"
                    >
                      <FaHospital />
                    </button>
                    <button
                      onClick={() => router.push(`/urgences/admissions?id=${adm.idAdmissionUrgence}`)}
                      className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-100"
                      title="Détails"
                    >
                      Voir
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <FaTimes className="text-red-400" />
        Ordre de priorité : critique &gt; urgent &gt; semi-urgent &gt; non urgent
      </div>
    </div>
  );
}
