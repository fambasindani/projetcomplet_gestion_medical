// components/layout/Header.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHospital, FaBell, FaUserCircle, FaSignOutAlt, FaBars,
  FaEnvelope, FaCog, FaKey, FaChevronDown
} from 'react-icons/fa';
import { useAuth } from '@/app/contexts/AuthContext'; 

interface HeaderProps {
  onMenuClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLLIElement>(null);

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
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  3
                </span>
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
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-3 rounded-t-xl text-white">
                      <div className="flex justify-between items-center">
                        <h6 className="font-semibold">Notifications</h6>
                        <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">3 nouvelles</span>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {/* Liste de notifications dynamique */}
                      <div className="border-b border-gray-100 p-4 hover:bg-gray-50">
                        <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center text-red-500">
                            <FaBell />
                          </div>
                          <div>
                            <p className="font-medium">Nouveau patient</p>
                            <p className="text-sm text-gray-500">Jean Dupont vient d&apos;être admis</p>
                            <span className="text-xs text-gray-400">Il y a 5 min</span>
                          </div>
                        </div>
                      </div>
                      {/* ... autres notifications ... */}
                    </div>
                    <div className="border-t border-gray-100 p-3 text-center">
                      <Link href="/notifications" className="text-sm text-indigo-600 hover:underline">
                        Voir toutes les notifications
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