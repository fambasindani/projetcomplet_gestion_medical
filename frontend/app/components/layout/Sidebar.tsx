'use client';

import { useEffect, useCallback, useReducer, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt, FaUserInjured, FaCalendarCheck, FaPills, FaClipboardList, FaCog,
  FaChevronLeft, FaChevronRight, FaHospital, FaAmbulance, FaHeartbeat, FaUsers,
  FaUserMd, FaStethoscope, FaFileMedical, FaAngleDown, FaAngleUp, FaProcedures,
  FaSyringe, FaFileInvoiceDollar, FaClipboardCheck, FaUserNurse, FaBed, FaNotesMedical,
  FaVial, FaMicroscope, FaXRay, FaHeart, FaBrain, FaEye, FaFlask, FaMoneyBillWave, FaChartBar,
  FaPrescriptionBottle,
  FaListAlt,
  FaBandAid
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';

interface MenuItem {
  path: string;
  name: string;
  icon: React.ElementType;
  roles?: string[];
  permission?: string;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  // DASHBOARD
  { path: '/dashboard', name: 'Dashboard', icon: FaTachometerAlt, badge: 'Actif', badgeColor: '#10b981', permission: 'DASHBOARD_VOIR' },

  // MÉDECINS
  {
    path: '/medecins-module',
    name: 'Médecins',
    icon: FaUserMd,
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
    permission: 'MEDECINS_VOIR',
    children: [
      { path: '/medecins', name: 'Médecins', icon: FaUserMd },
      { path: '/medecins/planning', name: 'Planning', icon: FaCalendarCheck },
      { path: '/specialites', name: 'Spécialités', icon: FaStethoscope },
    ]
  },

  // PATIENTS
  {
    path: '/patients-module',
    name: 'Patients',
    icon: FaUserInjured,
    badge: '12',
    badgeColor: '#667eea',
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
    permission: 'PATIENTS_VOIR',
    children: [
      { path: '/patients', name: 'Patients', icon: FaUserInjured },
  /*     { path: '/patients/dossiers', name: 'Dossiers médicaux', icon: FaClipboardList }, */
      { path: '/patients/hospitalisations', name: 'Hospitalisations', icon: FaProcedures },
     /*  { path: '/patients/constantes', name: 'Constantes', icon: FaHeartbeat }, */
    ]
  },

  // RENDEZ-VOUS
  {
    path: '/rendezvous-module',
    name: 'Rendez-vous',
    icon: FaCalendarCheck,
    badge: '8',
    badgeColor: '#f59e0b',
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
    permission: 'RENDEZ_VOUS_VOIR',
    children: [
      { path: '/rendezvous', name: 'Tous les rendez-vous', icon: FaCalendarCheck },
      { path: '/rendezvous/planning', name: 'Planning journalier', icon: FaClipboardCheck },
      { path: '/consultations', name: 'Consultations', icon: FaStethoscope },
    ]
  },

{
  path: '/prescriptions-module',
  name: 'Prescriptions',
  icon: FaPrescriptionBottle, // ou une icône appropriée
  roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
  permission: 'PRESCRIPTIONS_VOIR',
  children: [
    { path: '/prescriptions', name: 'Toutes les prescriptions', icon: FaListAlt },
    { path: '/prescriptions/medicaments', name: 'Prescriptions médicaments', icon: FaPills },
  /*   { path: '/prescriptions/examens', name: 'Prescriptions examens', icon: FaMicroscope },
    { path: '/prescriptions/soins', name: 'Prescriptions soins', icon: FaBandAid }, */
  ]
},


  // PHARMACIE
  {
    path: '/pharmacie-module',
    name: 'Pharmacie',
    icon: FaPills,
    roles: ['ADMIN', 'PHARMACIEN'],
    permission: 'PHARMACIE_VOIR',
    children: [
      { path: '/pharmacie/medicaments', name: 'Médicaments', icon: FaPills },
      { path: '/pharmacie/categories', name: 'Catégories', icon: FaFlask },
      { path: '/pharmacie/lots', name: 'Gestion des lots', icon: FaSyringe },
      { path: '/pharmacie/fournisseurs', name: 'Fournisseurs', icon: FaUsers },
      { path: '/pharmacie/commandes', name: 'Commandes', icon: FaClipboardList },
      { path: '/pharmacie/inventaire', name: 'Inventaire', icon: FaClipboardCheck },
      { path: '/pharmacie/alertes', name: 'Alertes stock', icon: FaHeartbeat },
      { path: '/pharmacie/delivrances', name: 'Délivrances', icon: FaFileMedical },
    ]
  },

  // EXAMENS
  {
    path: '/examens-module',
    name: 'Examens',
    icon: FaMicroscope,
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
    permission: 'EXAMENS_VOIR',
    children: [
      // { path: '/examens/radiologie', name: 'Radiologie', icon: FaXRay },
      // { path: '/examens/biologie', name: 'Biologie', icon: FaVial },
      // { path: '/examens/cardiologie', name: 'Cardiologie', icon: FaHeart },
      // { path: '/examens/neurologie', name: 'Neurologie', icon: FaBrain },
      // { path: '/examens/ophtalmologie', name: 'Ophtalmologie', icon: FaEye },
      { path: '/examens/liste', name: 'Tous les examens', icon: FaNotesMedical },
    ]
  },

  // URGENCES
  {
    path: '/urgences-module',
    name: 'Urgences',
    icon: FaAmbulance,
    badge: '3',
    badgeColor: '#ef4444',
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE', 'INFIRMIER'],
    permission: 'URGENCES_VOIR',
    children: [
      { path: '/urgences/admissions', name: 'Admissions', icon: FaHeartbeat },
      { path: '/urgences/interventions', name: 'Interventions', icon: FaFileMedical },
      { path: '/urgences/salle-attente', name: "Salle d'attente", icon: FaUsers },
    ]
  },

  // HOSPITALISATION
  {
    path: '/hospitalisation-module',
    name: 'Hospitalisation',
    icon: FaHospital,
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
    permission: 'HOSPITALISATIONS_VOIR',
    children: [
      // { path: '/hospitalisations/admissions', name: 'Admissions', icon: FaProcedures },
      { path: '/hospitalisations/chambres', name: 'Chambres', icon: FaBed },
      { path: '/hospitalisations/soins', name: 'Soins infirmiers', icon: FaUserNurse },
     /*  { path: '/hospitalisations/constantes', name: 'Constantes', icon: FaHeartbeat }, */
    ]
  },

  // PERSONNEL
  {
    path: '/personnel-module',
    name: 'Personnel',
    icon: FaUsers,
    roles: ['ADMIN', 'RH'],
    permission: 'PERSONNEL_VOIR',
    children: [
      { path: '/personnel', name: 'Liste du personnel', icon: FaUsers },
      { path: '/personnel/infirmiers', name: 'Infirmiers', icon: FaUserNurse },
    ]
  },

  // FACTURATION
  {
    path: '/facturation-module',
    name: 'Facturation',
    icon: FaFileInvoiceDollar,
    roles: ['ADMIN', 'SECRETAIRE', 'MEDECIN'],
    permission: 'FACTURATION_VOIR',
    children: [
      { path: '/factures', name: 'Factures', icon: FaFileInvoiceDollar },
      { path: '/factures/actes', name: 'Actes médicaux', icon: FaNotesMedical },
      { path: '/factures/catalogue', name: "Catalogue d'actes", icon: FaListAlt },
      { path: '/factures/paiements', name: 'Paiements', icon: FaMoneyBillWave },
      { path: '/factures/statistiques', name: 'Statistiques', icon: FaChartBar },
    ]
  },

  // PARAMÈTRES
  {
    path: '/parametres-module',
    name: 'Paramètres',
    icon: FaCog,
    roles: ['ADMIN'],
    permission: 'UTILISATEURS_GERER',
    children: [
      { path: '/settings/profil', name: 'Mon profil', icon: FaUserMd },
      { path: '/settings/utilisateurs', name: 'Utilisateurs', icon: FaUsers },
      { path: '/settings/roles', name: 'Rôles & permissions', icon: FaClipboardCheck },
    ]
  },
];

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

type SubmenuState = { [key: string]: boolean };
type SubmenuAction = { type: 'TOGGLE'; payload: string } | { type: 'SYNC_FROM_URL'; payload: string };

const submenuReducer = (state: SubmenuState, action: SubmenuAction): SubmenuState => {
  switch (action.type) {
    case 'TOGGLE':
      return { ...state, [action.payload]: !state[action.payload] };
    case 'SYNC_FROM_URL': {
      const newState = { ...state };
      menuItems.forEach(item => {
        if (item.children) {
          const shouldBeOpen = item.children.some(child => action.payload === child.path || action.payload.startsWith(child.path + '/'));
          newState[item.path] = shouldBeOpen;
        }
      });
      return newState;
    }
    default:
      return state;
  }
};

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar, isMobileOpen, onMobileClose }) => {
  const pathname = usePathname();
  const { user, permissions } = useAuth();

  const visibleMenuItems = menuItems.filter((item) => {
    // Priorité aux permissions explicites (RBAC) si elles sont fournies par le backend
    if (item.permission && permissions.length > 0) {
      return permissions.includes(item.permission);
    }
    // Repli sur le rôle (anciens jetons sans permissions)
    if (item.roles) {
      return !!user?.role && item.roles.includes(user.role);
    }
    return true;
  });

  const getInitialState = (): SubmenuState => {
    const state: SubmenuState = {};
    menuItems.forEach(item => {
      if (item.children) {
        state[item.path] = item.children.some(child => pathname === child.path || pathname.startsWith(child.path + '/'));
      }
    });
    return state;
  };
  const [openSubmenus, dispatch] = useReducer(submenuReducer, getInitialState());
  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    dispatch({ type: 'SYNC_FROM_URL', payload: pathname });
  }, [pathname]);

  const toggleSubmenu = (path: string, e: React.MouseEvent) => {
    e.preventDefault();
    // Si la barre est réduite, un clic sur une rubrique la déploie d'abord.
    if (isCollapsed) {
      toggleSidebar();
    }
    dispatch({ type: 'TOGGLE', payload: path });
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');
  const getActiveChild = (children?: MenuItem[]): MenuItem | null => {
    if (!children) return null;
    const matches = children.filter(child => isActive(child.path));
    if (matches.length === 0) return null;
    return matches.reduce((longest, child) => (child.path.length > longest.path.length ? child : longest));
  };
  const isChildActive = (children?: MenuItem[]) => getActiveChild(children) !== null;

  const handleLinkClick = () => {
    if (isMobileOpen && onMobileClose) onMobileClose();
  };

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const sidebarClasses = `fixed left-0 top-0 z-40 h-full bg-slate-900 text-white transition-all duration-300 ${sidebarWidth} ${
    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  }`;

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={handleLinkClick} />
      )}
      <aside className={sidebarClasses}>
        <div className={`flex h-16 items-center border-b border-slate-800 px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <FaHospital className="text-lg text-white" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="block text-sm font-bold leading-tight">Hôpital</span>
                <span className="block text-[11px] leading-tight text-slate-400">Saint-Luc</span>
              </div>
            )}
          </div>
          <button onClick={toggleSidebar} className="hidden rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white lg:block">
            {isCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 overflow-y-auto px-3">
          {visibleMenuItems.map((item) => (
            <div key={item.path} className="mb-1">
              {item.children ? (
                <div>
                  <div
                    onClick={(e) => toggleSubmenu(item.path, e)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path) || isChildActive(item.children) ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <item.icon size={20} />
                      {!isCollapsed && <span>{item.name}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: item.badgeColor }}>
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {!isCollapsed && (
                      <span className="ml-2">{openSubmenus[item.path] ? <FaAngleUp /> : <FaAngleDown />}</span>
                    )}
                  </div>
                  <AnimatePresence>
                    {!isCollapsed && openSubmenus[item.path] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="ml-4 mt-1 space-y-1 overflow-hidden border-l border-slate-800 pl-2"
                      >
                        {item.children.map((child) => {
                          const isActiveChild = getActiveChild(item.children)?.path === child.path;
                          return (
                            <Link
                              key={child.path}
                              href={child.path}
                              onClick={handleLinkClick}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActiveChild ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                              }`}
                            >
                              <child.icon size={16} />
                              <span>{child.name}</span>
                              {child.badge && <span className="ml-auto rounded bg-gray-700 px-1.5 text-xs">{child.badge}</span>}
                            </Link>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  href={item.path}
                  onClick={handleLinkClick}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    isActive(item.path) ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span>{item.name}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: item.badgeColor }}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="border-t border-slate-800 p-4 text-center">
            <p className="text-xs text-slate-500">Version 1.0.0</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-slate-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>Connecté</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;