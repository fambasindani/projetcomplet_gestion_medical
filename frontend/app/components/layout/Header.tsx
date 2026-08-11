// components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHospital, FaBell, FaUserCircle, FaSignOutAlt, FaBars,
  FaEnvelope, FaCog, FaKey, FaChevronDown, FaCheckDouble, FaClock
} from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext';
import { notificationService } from '@/app/services/notificationService';
import type { Notification } from '@/app/services/notificationService';

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
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
        // silencieux : la cloche reste neutre si le backend est indisponible
      }
    };
    void run();
    const interval = setInterval(() => { void run(); }, 60000);
    return () => { cancelled = true; clearInterval(interval); };
  }, [user]);

  useEffect(() => {
    if (!showNotifications) return;
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
    return () => { cancelled = true; };
  }, [showNotifications]);

  const handleMarkAll = async () => {
    await notificationService.marquerToutesLues();
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, lue: true })));
  };

  const handleMarkOne = async (id: number) => {
    await notificationService.marquerLue(id);
    setUnreadCount(prev => Math.max(0, prev - 1));
    setNotifications(prev => prev.map(n => (n.idNotification === id ? { ...n, lue: true } : n)));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'À l\'instant';
    if (mins < 60) return `Il y a ${mins} min`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `Il y a ${hours} h`;
    return d.toLocaleDateString('fr-FR');
  };

  // Données utilisateur (provenant du contexte)
  const utilisateur = {
    nom: user?.nom || "Dupont",
    prenom: user?.prenom || "Martin",
    role: user?.role || "Cardiologue",
    email: user?.email || "martin.dupont@hopital.fr"
  };
  const nomcomplet = `${utilisateur.prenom} ${utilisateur.nom}`;

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <motion.div initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}>
      <header className={`fixed top-0 z-50 w-full bg-white transition-all ${
        scrolled ? 'shadow-lg bg-white/95 backdrop-blur-sm' : 'shadow-sm'
      }`}>
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Left section with menu button and logo */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden mr-3 rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
            >
              <FaBars size={20} />
            </button>
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md">
                <FaHospital className="text-white text-xl" />
              </div>
              <div className="hidden sm:block">
                <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Hôpital Saint-Luc
                </span>
                <span className="block text-xs text-gray-500">Établissement de santé</span>
              </div>
            </Link>
          </div>

          {/* Right section: notifications, messages, user dropdown */}
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 rounded-xl bg-white shadow-xl ring-1 ring-black/5"
                  >
                    <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 rounded-t-xl text-white">
                      <h6 className="font-semibold">Notifications</h6>
                      <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
                        {unreadCount > 0 ? `${unreadCount} nouvelle${unreadCount > 1 ? 's' : ''}` : 'Tout est lu'}
                      </span>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-400">
                          Aucune notification pour le moment
                        </div>
                      ) : (
                        notifications.map((notif) => (
                          <button
                            key={notif.idNotification}
                            onClick={() => handleMarkOne(notif.idNotification)}
                            className={`block w-full border-b border-gray-100 p-4 text-left hover:bg-gray-50 ${notif.lue ? 'opacity-60' : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center ${notif.lue ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-500'}`}>
                                <FaBell />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate font-medium">{notif.titre}</p>
                                <p className="truncate text-sm text-gray-500">{notif.message}</p>
                                <span className="flex items-center gap-1 text-xs text-gray-400">
                                  <FaClock /> {formatDate(notif.dateCreation)}
                                </span>
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 p-3">
                      <button
                        onClick={handleMarkAll}
                        className="flex items-center gap-1 text-xs text-indigo-600 hover:underline"
                      >
                        <FaCheckDouble /> Tout marquer lu
                      </button>
                      <Link href="/notifications" className="text-sm text-indigo-600 hover:underline">
                        Tout voir
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Messages (desktop only) */}
            <div className="hidden md:block relative">
              <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-indigo-600">
                <FaEnvelope size={20} />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                  5
                </span>
              </button>
            </div>

            {/* User dropdown */}
            <li className="relative list-none" ref={userDropdownRef}>
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center gap-2 rounded-full px-3 py-1.5 transition hover:bg-gray-100"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-semibold text-white shadow-md">
                  {utilisateur.prenom?.[0]}{utilisateur.nom?.[0]}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-sm font-medium text-gray-800">{nomcomplet}</p>
                  <p className="text-xs text-gray-500">{utilisateur.role}</p>
                </div>
                <FaChevronDown className={`h-3 w-3 text-gray-500 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-72 rounded-xl bg-white shadow-xl ring-1 ring-black/5"
                  >
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-4 rounded-t-xl text-white flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-xl font-bold">
                        {utilisateur.prenom?.[0]}{utilisateur.nom?.[0]}
                      </div>
                      <div>
                        <h6 className="font-semibold">{nomcomplet}</h6>
                        <small className="opacity-90">{utilisateur.email}</small>
                      </div>
                    </div>
                    <div className="py-2">
                      <Link href="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                        <FaUserCircle className="text-indigo-500" />
                        <div>
                          <p className="text-sm font-medium">Mon Profil</p>
                          <p className="text-xs text-gray-500">Gérer vos informations</p>
                        </div>
                      </Link>
                      <Link href="/change-password" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                        <FaKey className="text-indigo-500" />
                        <div>
                          <p className="text-sm font-medium">Changer mot de passe</p>
                          <p className="text-xs text-gray-500">Mettre à jour votre mot de passe</p>
                        </div>
                      </Link>
                      <Link href="/settings" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition">
                        <FaCog className="text-indigo-500" />
                        <div>
                          <p className="text-sm font-medium">Paramètres</p>
                          <p className="text-xs text-gray-500">Préférences du compte</p>
                        </div>
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 pt-2 pb-2">
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 px-4 py-3 text-red-600 hover:bg-gray-50 transition"
                      >
                        <FaSignOutAlt />
                        <div>
                          <p className="text-sm font-medium">Déconnexion</p>
                          <p className="text-xs text-gray-500">Quitter la session</p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          </div>
        </div>
      </header>
    </motion.div>
  );
};

export default Header;