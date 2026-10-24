'use client';

import { useEffect, useReducer, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaTachometerAlt, FaUserInjured, FaCalendarCheck, FaPills, FaClipboardList, FaCog,
  FaChevronLeft, FaChevronRight, FaHospital, FaAmbulance, FaHeartbeat, FaUsers,
  FaUserMd, FaStethoscope, FaFileMedical, FaAngleDown, FaAngleUp, FaProcedures,
  FaSyringe, FaFileInvoiceDollar, FaClipboardCheck, FaUserNurse, FaBed, FaNotesMedical,
  FaMicroscope, FaFlask, FaMoneyBillWave, FaChartBar, FaSitemap,
  FaPrescriptionBottle,
  FaListAlt,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useAppSettings } from '../../contexts/AppSettingsContext';

interface MenuItem {
  path: string;
  name: string;
  icon: React.ElementType;
  roles?: string[];
  permission?: string;
  anyPermission?: string[];
  rolesOnly?: boolean;
  badge?: string;
  badgeColor?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  // PORTAIL PATIENT
  {
    path: '/mon-espace-module',
    name: 'menu.monEspace',
    icon: FaUserInjured,
    roles: ['PATIENT'],
    rolesOnly: true,
    permission: 'MON_ESPACE_VOIR',
    children: [
      { path: '/mon-espace/rendez-vous', permission: 'MES_RENDEZ_VOUS_VOIR', name: 'menu.mesRendezVous', icon: FaCalendarCheck },
      { path: '/mon-espace/examens', permission: 'MES_EXAMENS_VOIR', name: 'menu.mesResultats', icon: FaFlask },
      { path: '/mon-espace/ordonnances', permission: 'MES_ORDONNANCES_VOIR', name: 'menu.ordonnancesConsultations', icon: FaListAlt },
      { path: '/mon-espace/factures', permission: 'MES_FACTURES_VOIR', name: 'menu.mesFactures', icon: FaFileInvoiceDollar },
      { path: '/mon-espace/dossier', permission: 'MON_DOSSIER_VOIR', name: 'menu.monDossier', icon: FaClipboardList },
    ],
  },

  // DASHBOARD
  { path: '/dashboard', name: 'menu.dashboard', icon: FaTachometerAlt, badge: 'Actif', badgeColor: '#10b981', permission: 'DASHBOARD_VOIR' },

  // MÉDECINS
  {
    path: '/medecins-module',
    name: 'menu.medecins',
    icon: FaUserMd,
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE', 'RH'],
    anyPermission: ['MEDECINS_VOIR', 'PLANNING_GROUPE_VOIR'],
    children: [
      { path: '/medecins', name: 'menu.medecins', icon: FaUserMd, permission: 'MEDECINS_VOIR' },
      { path: '/medecins/planning', name: 'menu.planningGroupe', icon: FaCalendarCheck, permission: 'PLANNING_GROUPE_VOIR' },
      { path: '/specialites', name: 'menu.specialites', icon: FaStethoscope, permission: 'SPECIALITES_VOIR' },
    ]
  },

  // PATIENTS
  {
    path: '/patients-module',
    name: 'menu.patients',
    icon: FaUserInjured,
    badge: '12',
    badgeColor: '#667eea',
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
    permission: 'PATIENTS_VOIR',
    children: [
      { path: '/patients', name: 'menu.patients', icon: FaUserInjured },
    ]
  },

  // RENDEZ-VOUS
  {
    path: '/rendezvous-module',
    name: 'menu.rendezvous',
    icon: FaCalendarCheck,
    badge: '8',
    badgeColor: '#f59e0b',
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
    permission: 'RENDEZ_VOUS_VOIR',
    children: [
      { path: '/rendezvous', name: 'menu.tousRdv', icon: FaCalendarCheck },
      { path: '/rendezvous/planning', name: 'menu.planningJournalier', icon: FaClipboardCheck },
      { path: '/consultations', name: 'menu.consultations', icon: FaStethoscope, permission: 'CONSULTATIONS_VOIR' },
    ]
  },

  // SIGNES VITAUX (pré-consultation)
  {
    path: '/signes-vitaux',
    name: 'menu.signesVitaux',
    icon: FaHeartbeat,
    roles: ['ADMIN', 'MEDECIN', 'INFIRMIER'],
    permission: 'SIGNES_VITAUX_VOIR',
  },

{
  path: '/prescriptions-module',
  name: 'menu.prescriptions',
  icon: FaPrescriptionBottle,
  roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE'],
  permission: 'PRESCRIPTIONS_VOIR',
  children: [
    { path: '/prescriptions', name: 'menu.toutesPrescriptions', icon: FaListAlt },
    { path: '/prescriptions/medicaments', name: 'menu.prescriptionsMedicaments', icon: FaPills },
  ]
},

  // PHARMACIE
  {
    path: '/pharmacie-module',
    name: 'menu.pharmacie',
    icon: FaPills,
    roles: ['ADMIN', 'PHARMACIEN'],
    permission: 'PHARMACIE_VOIR',
    children: [
      { path: '/pharmacie/medicaments', name: 'menu.medicaments', icon: FaPills },
      { path: '/pharmacie/categories', name: 'menu.categories', icon: FaFlask },
      { path: '/pharmacie/lots', name: 'menu.lots', icon: FaSyringe },
      { path: '/pharmacie/fournisseurs', name: 'menu.fournisseurs', icon: FaUsers },
      { path: '/pharmacie/commandes', name: 'menu.commandes', icon: FaClipboardList },
      { path: '/pharmacie/inventaire', name: 'menu.inventaire', icon: FaClipboardCheck },
      { path: '/pharmacie/alertes', name: 'menu.alertesStock', icon: FaHeartbeat },
      { path: '/pharmacie/delivrances', name: 'menu.delivrances', icon: FaFileMedical },
    ]
  },

  // EXAMENS
  {
    path: '/examens-module',
    name: 'menu.examens',
    icon: FaMicroscope,
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE', 'LABORANTIN'],
    permission: 'EXAMENS_VOIR',
    children: [
      { path: '/examens/liste', name: 'menu.tousExamens', icon: FaNotesMedical },
    ]
  },

  // URGENCES
  {
    path: '/urgences-module',
    name: 'menu.urgences',
    icon: FaAmbulance,
    badge: '3',
    badgeColor: '#ef4444',
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE', 'INFIRMIER'],
    permission: 'URGENCES_VOIR',
    children: [
      { path: '/urgences/admissions', name: 'menu.admissions', icon: FaHeartbeat },
      { path: '/urgences/interventions', name: 'menu.interventions', icon: FaFileMedical },
      { path: '/urgences/salle-attente', name: 'menu.salleAttente', icon: FaUsers },
    ]
  },

  // HOSPITALISATION
  {
    path: '/hospitalisation-module',
    name: 'menu.hospitalisation',
    icon: FaHospital,
    roles: ['ADMIN', 'MEDECIN', 'SECRETAIRE', 'INFIRMIER'],
    permission: 'HOSPITALISATIONS_VOIR',
    children: [
      { path: '/patients/hospitalisations', name: 'menu.admissionsSejours', icon: FaProcedures, permission: 'HOSPITALISATIONS_VOIR' },
      { path: '/hospitalisations/chambres', name: 'menu.chambres', icon: FaBed, permission: 'CHAMBRES_VOIR' },
      { path: '/hospitalisations/soins', name: 'menu.soinsInfirmiers', icon: FaUserNurse, permission: 'SOINS_VOIR' },
    ]
  },

  // PERSONNEL
  {
    path: '/personnel-module',
    name: 'menu.personnel',
    icon: FaUsers,
    roles: ['ADMIN', 'RH'],
    permission: 'PERSONNEL_VOIR',
    children: [
      { path: '/personnel', name: 'menu.listePersonnel', icon: FaUsers },
      { path: '/personnel/infirmiers', name: 'menu.infirmiers', icon: FaUserNurse },
    ]
  },

  // FACTURATION
  {
    path: '/facturation-module',
    name: 'menu.facturation',
    icon: FaFileInvoiceDollar,
    roles: ['ADMIN', 'SECRETAIRE', 'MEDECIN'],
    permission: 'FACTURATION_VOIR',
    children: [
      { path: '/factures', name: 'menu.factures', icon: FaFileInvoiceDollar },
      { path: '/factures/catalogue', name: 'menu.catalogueActes', icon: FaListAlt },
      { path: '/factures/paiements', name: 'menu.paiements', icon: FaMoneyBillWave },
      { path: '/factures/statistiques', name: 'menu.statistiques', icon: FaChartBar },
    ]
  },

  // PARAMÈTRES
  {
    path: '/parametres-module',
    name: 'menu.parametres',
    icon: FaCog,
    roles: ['ADMIN'],
    permission: 'UTILISATEURS_GERER',
    children: [
      { path: '/settings/profil', name: 'menu.monProfil', icon: FaUserMd },
      { path: '/settings/utilisateurs', name: 'menu.utilisateurs', icon: FaUsers },
      { path: '/settings/roles', name: 'menu.rolesPermissions', icon: FaClipboardCheck },
      { path: '/settings/categories-examen', name: 'menu.categoriesExamen', icon: FaListAlt },
      { path: '/settings/laboratoires', name: 'menu.laboratoires', icon: FaFlask },
      { path: '/settings/services', name: 'menu.services', icon: FaSitemap },
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
  const { t } = useAppSettings();

  const canSee = (item: MenuItem): boolean => {
    if (item.rolesOnly && item.roles) {
      return !!user?.role && item.roles.includes(user.role);
    }
    if (permissions.length > 0) {
      if (item.anyPermission && item.anyPermission.length > 0) {
        return item.anyPermission.some((p) => permissions.includes(p));
      }
      if (item.permission) {
        return permissions.includes(item.permission);
      }
    }
    if (item.roles) {
      return !!user?.role && item.roles.includes(user.role);
    }
    return true;
  };

  const visibleMenuItems = menuItems
    .filter((item) => {
      if (item.children && item.children.length > 0 && !item.permission && !item.anyPermission) {
        const anyChild = item.children.some((c) => canSee(c));
        if (anyChild) return true;
      }
      return canSee(item);
    })
    .map((item) => {
      if (!item.children) return item;
      const children = item.children.filter((c) => {
        if (c.permission || c.anyPermission) return canSee(c);
        return true;
      });
      return { ...item, children };
    })
    .filter((item) => !item.children || item.children.length > 0);

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

  const badgeLabel = (badge?: string) => (badge === 'Actif' ? t('menu.badge.active') : badge);

  const sidebarWidth = isCollapsed ? 'w-20' : 'w-64';
  const sidebarClasses = `fixed left-0 top-0 z-40 flex h-full flex-col bg-[#0b1120] text-white transition-all duration-300 ${sidebarWidth} ${
    isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  }`;

  return (
    <>
      {isMobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={handleLinkClick} />
      )}
      <aside className={sidebarClasses}>
        <div className={`flex h-16 shrink-0 items-center border-b border-[#1e293b] px-4 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-sm">
              <FaHospital className="text-lg text-white" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="block text-sm font-bold leading-tight">Hôpital</span>
                <span className="block text-[11px] leading-tight text-[#94a3b8]">Saint-Luc</span>
              </div>
            )}
          </div>
          <button onClick={toggleSidebar} className="hidden rounded-lg p-1.5 text-[#94a3b8] transition hover:bg-[#1e293b] hover:text-white lg:block">
            {isCollapsed ? <FaChevronRight size={16} /> : <FaChevronLeft size={16} />}
          </button>
        </div>

        <nav className="mt-4 min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {visibleMenuItems.map((item) => (
            <div key={item.path} className="mb-1">
              {item.children ? (
                <div>
                  <div
                    onClick={(e) => toggleSubmenu(item.path, e)}
                    className={`flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive(item.path) || isChildActive(item.children) ? 'bg-[#1e293b] text-white' : 'text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <item.icon size={20} />
                      {!isCollapsed && <span>{t(item.name)}</span>}
                      {!isCollapsed && item.badge && (
                        <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: item.badgeColor }}>
                          {badgeLabel(item.badge)}
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
                        className="ml-4 mt-1 space-y-1 overflow-hidden border-l border-[#1e293b] pl-2"
                      >
                        {item.children.map((child) => {
                          const isActiveChild = getActiveChild(item.children)?.path === child.path;
                          return (
                            <Link
                              key={child.path}
                              href={child.path}
                              onClick={handleLinkClick}
                              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                                isActiveChild ? 'bg-[#1e293b] text-white' : 'text-[#94a3b8] hover:bg-[#1e293b] hover:text-white'
                              }`}
                            >
                              <child.icon size={16} />
                              <span>{t(child.name)}</span>
                              {child.badge && <span className="ml-auto rounded bg-[#374151] px-1.5 text-xs">{child.badge}</span>}
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
                    isActive(item.path) ? 'bg-[#1e293b] text-white' : 'text-[#cbd5e1] hover:bg-[#1e293b] hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span>{t(item.name)}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold" style={{ backgroundColor: item.badgeColor }}>
                      {badgeLabel(item.badge)}
                    </span>
                  )}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="shrink-0 border-t border-[#1e293b] p-4 text-center">
            <p className="text-xs text-[#64748b]">{t('menu.version')}</p>
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-[#94a3b8]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span>{t('menu.connected')}</span>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;