// components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FaBell, FaUserCircle, FaSignOutAlt, FaBars,
  FaCog, FaKey, FaChevronDown, FaCheckDouble, FaClock, FaHospital,
} from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import { notificationService } from '@/app/services/notificationService';
import type { Notification } from '@/app/services/notificationService';

interface HeaderProps {
  onMenuClick?: () => void;
}

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur',
  MEDECIN: 'Médecin',
  PATIENT: 'Patient',
  SECRETAIRE: 'Secrétaire',
  PHARMACIEN: 'Pharmacien',
  INFIRMIER: 'Infirmier',
  LABORANTIN: 'Laborantin',
  RH: 'Ressources humaines',
};

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLLIElement>(null);

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

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const diffMs = Date.now() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    return d.toLocaleDateString('fr-FR');
  };

  const initiales = `${user?.prenom?.[0] ?? ''}${user?.nom?.[0] ?? ''}`.toUpperCase() || '?';
  const nomComplet = user ? `${user.prenom ?? ''} ${user.nom ?? ''}`.trim() : 'Utilisateur';
  const roleLabel = user?.role ? (roleLabels[user.role] ?? user.role) : '';

  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-4 sm:px-6">
        {/* Left: mobile menu + brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <FaBars size={18} />
          </button>
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <FaHospital size={18} />
            </div>
            <div className="hidden sm:block">
              <span className="block text-sm font-bold leading-tight text-slate-900">Hôpital Saint-Luc</span>
              <span className="block text-[11px] leading-tight text-slate-500">Gestion hospitalière</span>
            </div>
          </Link>
        </div>

        {/* Right: notifications + user */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Notifications"
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
                    <h6 className="text-sm font-semibold text-slate-800">Notifications</h6>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] text-slate-500">
                      {unreadCount > 0 ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
                    </span>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-slate-400">Aucune notification</div>
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
                                <FaClock size={9} /> {formatDate(notif.dateCreation)}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                  <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2">
                    <button onClick={handleMarkAll} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
                      <FaCheckDouble size={11} /> Tout marquer lu
                    </button>
                    <Link href="/notifications" className="text-xs text-indigo-600 hover:underline">
                      Tout voir
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <span className="hidden h-6 w-px bg-slate-200 sm:block" />

          {/* User menu */}
          <li className="relative list-none" ref={userDropdownRef}>
            <button
              onClick={() => setShowUserDropdown((v) => !v)}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition hover:bg-slate-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
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
                      <FaUserCircle className="text-slate-400" /> Mon profil
                    </Link>
                    <Link href="/change-password" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FaKey className="text-slate-400" /> Changer le mot de passe
                    </Link>
                    <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                      <FaCog className="text-slate-400" /> Paramètres
                    </Link>
                  </div>
                  <div className="border-t border-slate-100 py-1">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <FaSignOutAlt /> Déconnexion
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
