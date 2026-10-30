import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaStethoscope } from 'react-icons/fa';
import api from '../services/api';
import { useAppSettings } from '../contexts/AppSettingsContext';

// Exemple de route dynamique migrée : /consultations/:id/details
// (équivalent de app/consultations/[id]/details en Next.js)
export default function ConsultationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useAppSettings();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(false);
    api
      .get(`/consultations/${id}`)
      .then((res) => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  return (
    <div className="space-y-5">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:underline"
      >
        <FaArrowLeft size={12} /> Retour
      </button>

      <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        {loading ? (
          <p className="text-sm text-slate-400">Chargement...</p>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <FaStethoscope className="text-3xl text-slate-300" />
            <p className="text-sm text-slate-500">Consultation #{id} introuvable</p>
          </div>
        ) : (
          <pre className="overflow-x-auto text-xs text-slate-600">{JSON.stringify(data, null, 2)}</pre>
        )}
      </div>

      <p className="text-xs text-slate-400">{t('app.loading') && 'Route dynamique de démonstration.'}</p>
    </div>
  );
}