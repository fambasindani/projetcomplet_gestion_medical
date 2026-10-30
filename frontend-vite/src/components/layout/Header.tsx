import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { FaBars, FaSignOutAlt, FaSun, FaMoon, FaGlobe, FaCheck, FaUserCircle, FaKey, FaCog } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAppSettings } from '../../contexts/AppSettingsContext';
import { Flag } from '../common/Flag';

interface HeaderProps {
  onMenuClick?: () => void;
}

const LANGUAGES: Array<{ code: 'fr' | 'en'; labelKey: string; flag: 'fr' | 'gb' }> = [
  { code: 'fr', labelKey: 'lang.french', flag: 'fr' },
  { code: 'en', labelKey: 'lang.english', flag: 'gb' },
];

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, lang, setLang, t } = useAppSettings();
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const userDropdownRef = useRef<HTMLLIElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) setShowUserDropdown(false);
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) setShowLangDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || '?';
  const nomComplet = user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() : t('header.defaultUser');
  const roleLabel = user?.role ? t(`roles.${user.role}`) : '';

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label={t('header.aria.menu')}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <FaBars size={18} />
          </button>
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white overflow-hidden ring-1 ring-slate-200">
              <img src="/Logo.png" alt="DGRAD" className="h-7 w-7 object-contain" />
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold leading-tight text-slate-900">Centre Hospitalier</span>
              <span className="block text-[11px] leading-tight text-slate-500">{t('header.brand.sub')}</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Langue */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setShowLangDropdown((v) => !v)}
              aria-label={t('common.language')}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <FaGlobe size={16} />
              <Flag code={currentLang.flag} className="h-3.5 w-5" />
            </button>
            <AnimatePresence>
              {showLangDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
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
            </AnimatePresence>
          </div>

          {/* Thème */}
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}
            className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ y: 16, opacity: 0, rotate: -60 }}
                animate={{ y: 0, opacity: 1, rotate: 0 }}
                exit={{ y: -16, opacity: 0, rotate: 60 }}
                transition={{ duration: 0.2 }}
                className="absolute"
              >
                {theme === 'dark' ? <FaMoon size={16} /> : <FaSun size={16} />}
              </motion.span>
            </AnimatePresence>
          </button>

          <span className="hidden h-6 w-px bg-slate-200 sm:block" />

          {/* Utilisateur */}
          <li className="relative list-none" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown((v) => !v)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f172a] text-xs font-semibold text-white">
                {initiales}
              </span>
              <span className="hidden text-left lg:block">
                <span className="block text-sm font-medium leading-tight text-slate-800">{nomComplet}</span>
                <span className="block text-[11px] leading-tight text-slate-500">{roleLabel}</span>
              </span>
            </button>
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-slate-200"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{nomComplet}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link to="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FaUserCircle className="text-slate-400" /> {t('header.myProfile')}
                    </Link>
                    <Link to="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FaKey className="text-slate-400" /> {t('header.changePassword')}
                    </Link>
                    <Link to="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FaCog className="text-slate-400" /> {t('header.settings')}
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt /> {t('header.logout')}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        </div>
      </div>
    </header>
  );
};

export default Header;