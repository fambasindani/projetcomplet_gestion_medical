import { Link } from 'react-router-dom';
import { useAppSettings } from '../contexts/AppSettingsContext';

export default function NotFound() {
  const { t } = useAppSettings();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <p className="text-7xl font-black text-indigo-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-slate-800">{t('notfound.title')}</h1>
      <p className="mt-2 text-sm text-slate-500">{t('notfound.text')}</p>
      <Link
        to="/dashboard"
        className="mt-6 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500"
      >
        {t('notfound.back')}
      </Link>
    </div>
  );
}