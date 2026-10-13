// components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaBell, FaUserCircle, FaSignOutAlt, FaBars,
  FaCog, FaKey, FaChevronDown, FaCheckDouble, FaClock, FaHospital,
  FaSun, FaMoon, FaGlobe, FaCheck,
} from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import { useAppSettings } from '@/app/contexts/AppSettingsContext';
import { Flag } from '@/app/components/common/Flag';
import { notificationService } from '@/app/services/notificationService';
import type { Notification } from '@/app/services/notificationService';

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
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLLIElement>(null);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const run = async () => {
      try {
        const [count, page] = await Promise.all([
          notificationService.countNonLues(),
          notificationService.getAll({ pageSize: 6 }),
        ]);
        if (!cancelled) {
          setUnreadCount(count);
          setNotifications(page.items);
        }
      } catch {
        // silencieux
      }
    };
    void run();
    const interval = setInterval(() => { void run(); }, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node))
        setShowNotifications(false);
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node))
        setShowUserDropdown(false);
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node))
        setShowLangDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAll = async () => {
    await notificationService.marquerToutesLues();
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, lue: true })));
  };

  const handleMarkOne = async (id: number) => {
    await notificationService.marquerLue(id);
    setUnreadCount((prev) => Math.max(0, prev - 1));
    setNotifications((prev) => prev.map((n) => (n.idNotification === id ? { ...n, lue: true } : n)));
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const formatDate = (dateStr: string, nowMs: number) => {
    const d = new Date(dateStr);
    const diffMs = nowMs - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return t('header.justNow');
    if (mins < 60) return t('header.minutesAgo', { n: mins });
    const hours = Math.floor(mins / 60);
    if (hours < 24) return t('header.hoursAgo', { n: hours });
    return d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US');
  };

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || '?';
  const nomComplet = user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() : t('header.defaultUser');
  const roleLabel = user?.role ? t(`roles.${user.role}`) : '';

  const currentLang = LANGUAGES.find((l) => l.code === lang) ?? LANGUAGES[0];

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* Left: mobile menu + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label={t('header.aria.menu')}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <FaBars size={18} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <FaHospital size={18} />
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold leading-tight text-slate-900">Hôpital Saint-Luc</span>
              <span className="block text-[11px] leading-tight text-slate-500">{t('header.brand.sub')}</span>
            </div>
          </Link>
        </div>

        {/* Right: language + theme + notifications + user */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Langue */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setShowLangDropdown((v) => !v)}
              aria-label={t('common.language')}
              title={t('common.language')}
              className="flex items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <FaGlobe size={16} />
              <Flag code={currentLang.flag} className="h-3.5 w-5" />
              <FaChevronDown className={`h-3 w-3 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} />
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
            title={theme === 'dark' ? t('theme.toggleLight') : t('theme.toggleDark')}
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

          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              aria-label={t('header.notifications')}
              className="relative rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <FaBell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                    <h6 className="text-sm font-semibold text-slate-800">{t('header.notifications')}</h6>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      {unreadCount > 0
                        ? t('header.unread', { n: unreadCount, s: unreadCount > 1 ? 's' : '' })
                        : t('header.allRead')}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">{t('header.noNotif')}</div>
                    ) : (
                      notifications.map((notif) => (
                        <button
                          key={notif.idNotification}
                          onClick={() => handleMarkOne(notif.idNotification)}
                          className={`block w-full border-b border-slate-50 p-4 text-left transition hover:bg-slate-50 ${notif.lue ? 'opacity-60' : ''}`}
                        >
                          <div className="flex gap-3">
                            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${notif.lue ? 'bg-slate-100 text-slate-400' : 'bg-red-50 text-red-500'}`}>
                              <FaBell size={12} />
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-slate-800">{notif.titre}</p>
                              <p className="truncate text-xs text-slate-500">{notif.message}</p>
                              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                <FaClock size={9} /> {formatDate(notif.dateCreation, now)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                    <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                      <FaCheckDouble size={11} /> {t('header.markAll')}
                    </button>
                    <Link href="/notifications" className="text-xs text-indigo-600 hover:underline">
                      {t('header.viewAll')}
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User menu */}
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
              <FaChevronDown className={`h-3 w-3 text-slate-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {showUserDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 overflow-hidden rounded-xl bg-white shadow-lg ring-1 ring-slate-200"
                >
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-sm font-semibold text-slate-800">{nomComplet}</p>
                    <p className="truncate text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <div className="py-1">
                    <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FaUserCircle className="text-slate-400" /> {t('header.myProfile')}
                    </Link>
                    <Link href="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FaKey className="text-slate-400" /> {t('header.changePassword')}
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
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