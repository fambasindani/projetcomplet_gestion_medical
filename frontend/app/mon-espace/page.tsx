'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  FaCalendarCheck, FaFlask, FaFileMedical, FaFileInvoiceDollar,
  FaFolderOpen, FaStethoscope, FaArrowRight,
} from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import { patientPortalService } from '@/app/services/patientPortalService';
import PageHeader from '@/app/ui/PageHeader';

export default function MonEspacePage() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<{ rdv: number; examens: number; ordonnances: number; factures: number; restant: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [rdv, examens, ordonnances, factures] = await Promise.all([
          patientPortalService.getRendezVous(),
          patientPortalService.getExamens(),
          patientPortalService.getOrdonnances(),
          patientPortalService.getFactures(),
        ]);
        const restant = factures.reduce((a, f) => a + (f.montantRestant ?? 0), 0);
        setCounts({ rdv: rdv.length, examens: examens.length, ordonnances: ordonnances.length, factures: factures.length, restant });
      } catch {
        setCounts({ rdv: 0, examens: 0, ordonnances: 0, factures: 0, restant: 0 });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cards = counts ? [
    { label: 'Mes rendez-vous', value: counts.rdv, icon: FaCalendarCheck, color: '#0ea5e9', href: '/mon-espace/rendez-vous' },
    { label: 'Mes résultats', value: counts.examens, icon: FaFlask, color: '#10b981', href: '/mon-espace/examens' },
    { label: 'Mes ordonnances', value: counts.ordonnances, icon: FaFileMedical, color: '#8b5cf6', href: '/mon-espace/ordonnances' },
    { label: 'Mes factures', value: counts.factures, icon: FaFileInvoiceDollar, color: '#f59e0b', href: '/mon-espace/factures' },
  ] : [];

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-5">
      <PageHeader title="Mon espace patient" subtitle={`Bienvenue ${user?.prenom ?? ''} ${user?.nom ?? ''}`} />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-5 text-white shadow-sm">
        <div>
          <p className="text-lg font-semibold">Bonjour {user?.prenom} {user?.nom}</p>
          <p className="mt-0.5 text-sm capitalize text-white/80">{dateLabel}</p>
        </div>
        <Link href="/mon-espace/dossier" className="inline-flex items-center gap-2 rounded-lg bg-white/15 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/25">
          <FaFolderOpen size={13} /> Mon dossier médical
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="block">
            <div className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md">
              <span className="absolute inset-y-0 left-0 w-1" style={{ background: c.color }} />
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.label}</p>
                  <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">
                    {loading ? '…' : c.value}
                  </div>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${c.color}14`, color: c.color }}>
                  <c.icon className="text-base" />
                </div>
              </div>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-slate-600">
                Voir <FaArrowRight size={9} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      {!loading && counts && counts.restant > 0 && (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-5 py-4">
          <p className="flex items-center gap-2 text-sm text-amber-800">
            <FaFileInvoiceDollar /> Vous avez un reste à payer de{' '}
            <strong>{counts.restant.toFixed(2)} $</strong>.
            <Link href="/mon-espace/factures" className="font-semibold underline">Voir mes factures</Link>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <QuickLink href="/mon-espace/rendez-vous" icon={<FaCalendarCheck />} title="Prendre rendez-vous" text="Demandez un nouveau rendez-vous ou annulez un rendez-vous existant." />
        <QuickLink href="/mon-espace/examens" icon={<FaStethoscope />} title="Consulter mes résultats" text="Résultats d'examens validés par le laboratoire." />
        <QuickLink href="/mon-espace/dossier" icon={<FaFolderOpen />} title="Mon dossier" text="Constantes, allergies et antécédents médicaux." />
      </div>
    </div>
  );
}

function QuickLink({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="block rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition hover:shadow-md">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">{icon}</span>
        <div>
          <p className="text-sm font-semibold text-slate-800">{title}</p>
          <p className="mt-0.5 text-xs text-slate-500">{text}</p>
        </div>
      </div>
    </Link>
  );
}
