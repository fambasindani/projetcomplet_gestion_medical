import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt, FaExclamationCircle,
  FaCheckCircle, FaUserShield, FaArrowRight, FaSun, FaMoon, FaGlobe, FaCheck,
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useAppSettings } from '../contexts/AppSettingsContext';
import { Flag } from '../components/common/Flag';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const REMEMBER_KEY = 'remember_email';

const LANGUAGES: Array<{ code: 'fr' | 'en'; labelKey: string; flag: 'fr' | 'gb' }> = [
  { code: 'fr', labelKey: 'lang.french', flag: 'fr' },
  { code: 'en', labelKey: 'lang.english', flag: 'gb' },
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login } = useAuth();
  const { theme, toggleTheme, lang, setLang, t } = useAppSettings();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(REMEMBER_KEY);
    if (!saved) return;
    const id = setTimeout(() => {
      setEmail(saved);
      setRemember(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  if (user) {
    return <Navigate to={redirectTo()} replace />;
  }

  function redirectTo() {
    const from = (location.state as { from?: string } | null)?.from;
    return from && from.startsWith('/') && from !== '/login' ? from : '/dashboard';
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login({ email, password });
      if (remember) localStorage.setItem(REMEMBER_KEY, email);
      else localStorage.removeItem(REMEMBER_KEY);
      toast.success(t('login.toast.success'));
      navigate(redirectTo(), { replace: true });
    } catch (err) {
      let message = t('login.error.default');
      if (axios.isAxiosError<{ message?: string }>(err)) {
        message = err.response?.data?.message ?? message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:cursor-not-allowed disabled:bg-slate-50';

  const features = [
    { icon: FaUserShield, title: t('login.feature.1.title'), text: t('login.feature.1.text') },
    { icon: FaShieldAlt, title: t('login.feature.2.title'), text: t('login.feature.2.text') },
    { icon: FaCheckCircle, title: t('login.feature.3.title'), text: t('login.feature.3.text') },
  ];
  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <div className="flex min-h-screen">
      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <div className="relative">
          <button
            onClick={() => setShowLangDropdown((v) => !v)}
            aria-label={t('common.language')}
            className="flex items-center gap-1.5 rounded-lg bg-white/80 px-2.5 py-2 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:text-slate-700"
          >
            <FaGlobe size={15} />
            <Flag code={currentLang.flag} className="h-3.5 w-5" />
          </button>
          {showLangDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
            >
              {LANGUAGES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => {
                    setLang(item.code);
                    setShowLangDropdown(false);
                  }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-sm transition ${
                    lang === item.code
                      ? 'bg-slate-50 font-semibold text-indigo-600'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Flag code={item.flag} className="h-3.5 w-5" />
                  <span className="flex-1 text-left">{t(item.labelKey)}</span>
                  {lang === item.code && <FaCheck size={11} />}
                </button>
              ))}
            </motion.div>
          )}
        </div>
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 text-slate-500 shadow-sm ring-1 ring-slate-200 backdrop-blur transition hover:text-slate-700"
        >
          {theme === 'dark' ? <FaMoon size={15} /> : <FaSun size={15} />}
        </button>
      </div>

      {/* Panneau de marque */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex xl:p-16">
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-sky-500/20 blur-3xl" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="relative flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white overflow-hidden ring-1 ring-slate-200 shadow-sm">
            <img src="/Logo.png" alt="DGRAD" className="h-9 w-9 object-contain" />
          </div>
          <div>
            <p className="text-base font-bold leading-tight">{t('login.brand.name')}</p>
            <p className="text-xs text-slate-400">{t('login.hero.subtitle')}</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative max-w-md">
          <h2 className="bg-gradient-to-r from-indigo-300 to-sky-300 bg-clip-text text-3xl font-bold leading-tight text-transparent xl:text-4xl">
            {t('login.hero.title')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400">{t('login.hero.text')}</p>
          <div className="mt-8 space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-white/10 text-indigo-300 ring-1 ring-white/10">
                  <f.icon size={14} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-slate-400">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="relative flex items-center justify-between border-t border-white/10 pt-6 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} {t('login.brand.name')} — {t('login.rights')}</span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {t('login.status')}
          </span>
        </motion.div>
      </aside>

      {/* Formulaire */}
      <main className="relative flex flex-1 items-center justify-center bg-slate-100 px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-slate-900/5 sm:p-10"
        >
          <div className="flex flex-col items-center">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm overflow-hidden lg:hidden">
              <img src="/Logo.png" alt="DGRAD" className="h-11 w-11 object-contain" />
            </div>
            <p className="text-sm text-slate-500">{t('login.subtitle')}</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-100 bg-red-50 px-3.5 py-3 text-sm text-red-700"
              role="alert"
            >
              <FaExclamationCircle className="mt-0.5 flex-none" size={14} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                {t('login.email')}
              </label>
              <div className="relative">
                <FaEnvelope className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className={inputClass}
                  placeholder={t('login.placeholder.email')}
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                  {t('login.password')}
                </label>
                <button
                  type="button"
                  onClick={() => toast(t('login.forgot.hint'))}
                  className="text-xs font-medium text-indigo-600 transition hover:text-indigo-700 hover:underline"
                >
                  {t('login.forgot')}
                </button>
              </div>
              <div className="relative">
                <FaLock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className={`${inputClass} pr-11`}
                  placeholder={t('login.placeholder.password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={loading}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
                >
                  {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer select-none items-center gap-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                disabled={loading}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 accent-indigo-600 focus:ring-indigo-500"
              />
              {t('login.remember')}
            </label>

            <button
              type="submit"
              disabled={loading}
              className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:from-indigo-500 hover:to-indigo-600 hover:shadow-indigo-500/40 focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  {t('login.loading')}
                </>
              ) : (
                <>
                  {t('login.submit')}
                  <FaArrowRight className="transition-transform group-hover:translate-x-1" size={13} />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 pt-1">
              <FaShieldAlt className="h-3.5 w-3.5 text-slate-400" />
              <p className="text-center text-xs text-slate-400">{t('login.security.note')}</p>
            </div>
          </form>
        </motion.div>

        <p className="absolute bottom-5 text-xs text-slate-400 lg:hidden">© {new Date().getFullYear()} {t('login.brand.name')}</p>
      </main>
    </div>
  );
}