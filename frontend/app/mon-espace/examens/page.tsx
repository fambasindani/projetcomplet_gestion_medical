'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaFlask, FaCheckCircle, FaFilePdf } from 'react-icons/fa';
import { pdf } from '@react-pdf/renderer';
import { useAuth } from '@/app/contexts/AuthContext';
import { patientPortalService, type MonExamen } from '@/app/services/patientPortalService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import ExamensPDF from '@/app/components/examens/ExamensPDF';
import PageHeader from '@/app/ui/PageHeader';
import SkeletonTable from '@/app/ui/SkeletonTable';

export default function MesExamensPage() {
  const { user } = useAuth();
  const [examens, setExamens] = useState<MonExamen[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState<number | null>(null);
  const [pdfLoading, setPdfLoading] = useState<number | null>(null);

  const telechargerPdf = async (e: MonExamen) => {
    setPdfLoading(e.idExamen);
    try {
      const examenPourPdf = {
        idExamen: e.idExamen,
        numeroExamen: e.numeroExamen,
        typeExamen: e.typeExamen,
        idCategorieExamen: 0,
        libelleCategorie: '',
        statut: e.statut,
        datePrescription: e.datePrescription,
        dateRealisation: e.dateRealisation ?? undefined,
        laboratoire: e.laboratoire ?? undefined,
        resultat: e.resultat ?? undefined,
        interpretation: e.interpretation ?? undefined,
        compteRendu: e.compteRendu ?? undefined,
        conclusion: e.conclusion ?? undefined,
      } as never;

      const blob = await pdf(
        <ExamensPDF
          examens={[examenPourPdf]}
          titre={`Résultat d'examen ${e.numeroExamen}`}
          patientNom={user?.nom ?? ''}
          patientPrenom={user?.prenom ?? ''}
        />,
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resultat-${e.numeroExamen}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Impossible de générer le PDF');
    } finally {
      setPdfLoading(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const data = await patientPortalService.getExamens();
        setExamens(Array.isArray(data) ? data : []);
      } catch (e) {
        toast.error(extractErrorMessage(e));
        setExamens([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-5">
      <PageHeader title="Mes résultats d'examens" subtitle="Uniquement les examens réalisés et validés" />

      {loading ? (
        <SkeletonTable columns={4} rows={6} />
      ) : examens.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl bg-white py-16 text-center shadow-sm ring-1 ring-slate-200">
          <FaFlask className="text-4xl text-slate-200" />
          <p className="text-sm text-slate-400">Aucun résultat disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {examens.map((e) => (
            <div key={e.idExamen} className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="flex items-center gap-3 px-5 py-4">
                <button
                  onClick={() => setOpen(open === e.idExamen ? null : e.idExamen)}
                  className="flex min-w-0 flex-1 items-center justify-between gap-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                      <FaFlask className="text-emerald-500" /> {e.typeExamen}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      N° {e.numeroExamen}
                      {e.dateRealisation && ` • réalisé le ${new Date(e.dateRealisation).toLocaleDateString('fr-FR')}`}
                      {e.laboratoire && ` • ${e.laboratoire}`}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                    <FaCheckCircle size={11} /> {e.statut}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => void telechargerPdf(e)}
                  disabled={pdfLoading === e.idExamen}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 transition hover:bg-rose-100 disabled:opacity-50"
                  title="Télécharger le PDF"
                >
                  <FaFilePdf size={12} /> {pdfLoading === e.idExamen ? '...' : 'PDF'}
                </button>
              </div>

              {open === e.idExamen && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 text-sm">
                  <Field label="Résultat" value={e.resultat} />
                  <Field label="Interprétation" value={e.interpretation} />
                  <Field label="Compte rendu" value={e.compteRendu} />
                  <Field label="Conclusion" value={e.conclusion} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="mb-3 last:mb-0">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-slate-700">{value}</p>
    </div>
  );
}
