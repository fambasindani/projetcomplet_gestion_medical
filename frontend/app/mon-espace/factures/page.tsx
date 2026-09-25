'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaFileInvoiceDollar, FaWallet, FaHourglassHalf } from 'react-icons/fa';
import { patientPortalService, type MaFacture } from '@/app/services/patientPortalService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import SkeletonTable from '@/app/ui/SkeletonTable';

const STATUT: Record<string, { bg: string; color: string; label: string }> = {
  Payé: { bg: '#10b98114', color: '#059669', label: 'Payé' },
  Partiellement_payé: { bg: '#f59e0b14', color: '#d97706', label: 'Partiellement payé' },
  En_attente: { bg: '#0ea5e914', color: '#0284c7', label: 'En attente' },
  Annulé: { bg: '#ef444414', color: '#dc2626', label: 'Annulé' },
};

export default function MesFacturesPage() {
  const [factures, setFactures] = useState<MaFacture[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setFactures(await patientPortalService.getFactures());
      } catch (e) {
        toast.error(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const totalRestant = factures.reduce((a, f) => a + (f.montantRestant ?? 0), 0);
  const totalPaye = factures.reduce((a, f) => a + (f.montantPaye ?? 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader title="Mes factures" subtitle="Suivi de vos factures et de vos paiements" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Kpi label="Factures" value={String(factures.length)} icon={FaFileInvoiceDollar} color="#6366f1" />
        <Kpi label="Total payé" value={`${totalPaye.toFixed(2)} $`} icon={FaWallet} color="#10b981" />
        <Kpi label="Reste à payer" value={`${totalRestant.toFixed(2)} $`} icon={FaHourglassHalf} color="#ef4444" />
      </div>

      {loading ? (
        <SkeletonTable columns={5} rows={5} />
      ) : factures.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
          <FaFileInvoiceDollar className="text-4xl text-slate-200" />
          <p className="text-sm text-slate-400">Aucune facture.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {factures.map((f) => {
            const st = STATUT[f.statut] ?? { bg: '#64748b14', color: '#475569', label: f.statut };
            return (
              <div key={f.idFacture} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
                <button
                  onClick={() => setOpen(open === f.idFacture ? null : f.idFacture)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-slate-50"
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{f.numeroFacture}</p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      émise le {new Date(f.dateEmission).toLocaleDateString('fr-FR')}
                      {f.dateEcheance && ` • échéance ${new Date(f.dateEcheance).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-800">{f.montantTtc.toFixed(2)} $</p>
                      {f.montantRestant > 0 && (
                        <p className="text-xs text-rose-600">reste {f.montantRestant.toFixed(2)} $</p>
                      )}
                    </div>
                    <span className="rounded-md px-2.5 py-1 text-xs font-medium" style={{ background: st.bg, color: st.color }}>
                      {st.label}
                    </span>
                  </div>
                </button>

                {open === f.idFacture && (
                  <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                          <th className="pb-2">Prestation</th>
                          <th className="pb-2 text-center">Qté</th>
                          <th className="pb-2 text-right">P.U.</th>
                          <th className="pb-2 text-right">Montant</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {f.details.map((d, i) => (
                          <tr key={i}>
                            <td className="py-2 text-slate-700">{d.description}</td>
                            <td className="py-2 text-center text-slate-600">{d.quantite}</td>
                            <td className="py-2 text-right text-slate-600">{Number(d.prixUnitaire).toFixed(2)} $</td>
                            <td className="py-2 text-right font-medium text-slate-700">{Number(d.montantHt).toFixed(2)} $</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="mt-3 flex flex-wrap justify-end gap-6 border-t border-slate-200 pt-3 text-xs text-slate-500">
                      <span>Total payé : <strong className="text-emerald-600">{f.montantPaye.toFixed(2)} $</strong></span>
                      <span>Reste : <strong className="text-rose-600">{f.montantRestant.toFixed(2)} $</strong></span>
                    </div>
                    <p className="mt-3 text-xs text-slate-400">
                      Le paiement en ligne sera disponible prochainement. Pour régler, contactez la caisse de l&apos;hôpital.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ElementType; color: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70">
      <span className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <div className="mt-2 text-xl font-semibold tabular-nums text-slate-900">{value}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: `${color}14`, color }}>
          <Icon className="text-base" />
        </div>
      </div>
    </div>
  );
}
