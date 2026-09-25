'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaFileMedical, FaStethoscope } from 'react-icons/fa';
import { patientPortalService, type MonOrdonnance, type MaConsultation } from '@/app/services/patientPortalService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import SkeletonTable from '@/app/ui/SkeletonTable';

export default function MesOrdonnancesPage() {
  const [onglet, setOnglet] = useState<'ordonnances' | 'consultations'>('ordonnances');
  const [ordonnances, setOrdonnances] = useState<MonOrdonnance[]>([]);
  const [consultations, setConsultations] = useState<MaConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [o, c] = await Promise.all([
          patientPortalService.getOrdonnances(),
          patientPortalService.getConsultations(),
        ]);
        setOrdonnances(o);
        setConsultations(c);
      } catch (e) {
        toast.error(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Mes ordonnances & consultations" subtitle="Historique de vos prescriptions et consultations" />

      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {([
            { key: 'ordonnances' as const, label: `Ordonnances (${ordonnances.length})` },
            { key: 'consultations' as const, label: `Consultations (${consultations.length})` },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setOnglet(t.key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                onglet === t.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {loading ? (
        <SkeletonTable columns={3} rows={5} />
      ) : onglet === 'ordonnances' ? (
        ordonnances.length === 0 ? <Vide icon={<FaFileMedical />} texte="Aucune ordonnance." /> : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {ordonnances.map((o) => (
              <div key={o.idPrescription} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">N° {o.numeroPrescription}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(o.datePrescription).toLocaleDateString('fr-FR')} • {o.medecinNom ?? '-'}
                    </p>
                  </div>
                  <span className="rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700">
                    {o.typePrescription}
                  </span>
                </div>
                {o.description && <p className="mt-3 text-sm text-slate-600">{o.description}</p>}
                {o.instructions && (
                  <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{o.instructions}</p>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        consultations.length === 0 ? <Vide icon={<FaStethoscope />} texte="Aucune consultation." /> : (
          <div className="space-y-3">
            {consultations.map((c) => (
              <div key={c.idConsultation} className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{c.motifConsultation || 'Consultation'}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {new Date(c.dateConsultation).toLocaleDateString('fr-FR')} • {c.medecinNom ?? '-'}
                    </p>
                  </div>
                </div>
                {c.diagnostic && (
                  <p className="mt-3 text-sm text-slate-600"><span className="font-medium text-slate-500">Diagnostic : </span>{c.diagnostic}</p>
                )}
                {c.observations && (
                  <p className="mt-2 text-sm text-slate-600"><span className="font-medium text-slate-500">Observations : </span>{c.observations}</p>
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function Vide({ icon, texte }: { icon: React.ReactNode; texte: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
      <span className="text-4xl text-slate-200">{icon}</span>
      <p className="text-sm text-slate-400">{texte}</p>
    </div>
  );
}
