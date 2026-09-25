'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  FaUserInjured, FaUserMd, FaCalendarCheck, FaExclamationTriangle,
  FaPills, FaStethoscope, FaArrowRight, FaClock, FaHospital,
  FaFileInvoiceDollar, FaFlask, FaUserNurse, FaUsers, FaMicroscope,
  FaChartLine, FaMoneyBillWave, FaBoxes, FaUserCheck, FaWallet,
  FaPercentage, FaBed, FaClipboardList,
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import { AreaChart, BarChart, DonutChart, PALETTE } from '../ui/Charts';
import PeriodeFilter, { type PeriodeFiltre } from '../ui/PeriodeFilter';
import { useAuth } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import SkeletonCards from '../ui/SkeletonCards';
import { patientService } from '../services/patientService';
import { medecinService } from '../services/medecinService';
import { planningService } from '../services/planningService';
import { rendezvousService } from '../services/rendezvousService';
import { consultationService } from '../services/consultationService';
import { alerteStockService } from '../services/alerteStockService';
import { factureService } from '../services/factureService';
import { examenService } from '../services/examenService';
import { soinInfirmierService } from '../services/soinInfirmierService';
import { delivranceService } from '../services/delivranceService';
import { personnelService } from '../services/personnelService';
import { hospitalisationService } from '../services/hospitalisationService';
import type { RapportMargePharmacie } from '../types/delivrance';
import type { RendezVous } from '../types/rendezvous';
import type { AlerteStock } from '../types/alerte';
import type { Examen } from '../types/examen';
import type { SoinInfirmier } from '../types/soin';
import type { FactureStats } from '../types/facture';

const COLORS = PALETTE;

const AlerteTypeLabels: Record<string, string> = {
  STOCK_FAIBLE: 'Stock faible',
  STOCK_CRITIQUE: 'Stock critique',
  PEREMPTION_PROCHAINE: 'Péremption prochaine',
  PEREMPTION_DEPASSEE: 'Péremption dépassée',
  STOCK_BAS: 'Stock bas',
};

const roleLabels: Record<string, string> = {
  ADMIN: 'Administrateur', MEDECIN: 'Médecin', SECRETAIRE: 'Secrétaire',
  PHARMACIEN: 'Pharmacien', INFIRMIER: 'Infirmier', LABORANTIN: 'Laborantin',
  RH: 'Ressources humaines', PATIENT: 'Patient',
};

interface StatCardDef {
  title: string;
  value: number | string;
  sub?: string;
  icon: React.ElementType;
  color: string;
  href?: string;
}

const Dashboard = () => {
  const { user, hasPermission } = useAuth();
  const router = useRouter();
  const role = user?.role;
  const peut = (p: string) => hasPermission(p);

  // Le rôle PATIENT n'a pas de tableau de bord d'établissement : il est
  // redirigé vers son espace personnel.
  useEffect(() => {
    if (role === 'PATIENT') router.replace('/mon-espace');
  }, [role, router]);

  const [loading, setLoading] = useState(true);
  const [patientStats, setPatientStats] = useState<{ totalPatients?: number; patientsRecents?: number } | null>(null);
  const [medecinStats, setMedecinStats] = useState<{ resume?: { totalMedecins?: number }; parSpecialite?: { specialite: string; nombreMedecins: number }[] } | null>(null);
  const [consultationStats, setConsultationStats] = useState<{ total?: number; consultationsMois?: number; medecinsActifs?: number; parMois?: { mois: string; nombre: number }[] } | null>(null);
  const [rdvStats, setRdvStats] = useState<{ aujourdhui?: number } | null>(null);
  const [rdvDuJour, setRdvDuJour] = useState<RendezVous[]>([]);
  const [alertes, setAlertes] = useState<AlerteStock[]>([]);
  const [alertesCount, setAlertesCount] = useState(0);
  const [factureStats, setFactureStats] = useState<FactureStats | null>(null);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [soins, setSoins] = useState<SoinInfirmier[]>([]);
  const [soinsCount, setSoinsCount] = useState(0);
  const [delivranceStats, setDelivranceStats] = useState<{ totalDelivrances?: number; delivrancesCeMois?: number; montantTotal?: number } | null>(null);
  const [personnelCount, setPersonnelCount] = useState(0);
  const [personnelStats, setPersonnelStats] = useState<{ totalPersonnels?: number; topFonctions?: { fonction: string; effectif: number }[] } | null>(null);
  const [marge, setMarge] = useState<RapportMargePharmacie | null>(null);
  const [hospitalisationsCount, setHospitalisationsCount] = useState(0);
  const [filtre, setFiltre] = useState<PeriodeFiltre>({ dateDebut: '', dateFin: '', granularite: 'month' });

  useEffect(() => {
    const run = async () => {
      const tasks: Promise<unknown>[] = [];
      const push = <T,>(p: Promise<T>, set: (v: T) => void) => {
        tasks.push(p.then(set).catch(() => undefined));
      };

      if (peut('PATIENTS_VOIR')) push(patientService.getStatistiques(), setPatientStats);
      if (peut('MEDECINS_VOIR')) push(medecinService.getStatistiques(), setMedecinStats);
      if (peut('CONSULTATIONS_VOIR')) {
        push(consultationService.getStats({
          dateDebut: filtre.dateDebut || null,
          dateFin: filtre.dateFin || null,
          granularite: filtre.granularite,
        }), setConsultationStats);
      }
      if (peut('RENDEZ_VOUS_VOIR')) {
        push(planningService.getStats(), setRdvStats);
        push(rendezvousService.getPlanningJournalier(new Date()), setRdvDuJour);
      }
      if (peut('PHARMACIE_VOIR')) {
        push(alerteStockService.search({ traitee: false, pageSize: 6 }).then((r) => {
          setAlertes(r.items); setAlertesCount(r.totalCount); return r;
        }), () => undefined);
        push(delivranceService.getStatistiques(), setDelivranceStats);
        push(delivranceService.getRapportMarge(), setMarge);
      }
      if (peut('FACTURATION_VOIR') && (role === 'ADMIN' || role === 'SECRETAIRE')) {
        push(factureService.getStatistiques({
          dateDebut: filtre.dateDebut || null,
          dateFin: filtre.dateFin || null,
          granularite: filtre.granularite,
        }), setFactureStats);
      }
      if (peut('EXAMENS_VOIR')) push(examenService.getAll(1, 200).then((r) => r.items), setExamens);
      if (peut('SOINS_VOIR')) push(soinInfirmierService.search({ page: 0, size: 50 }).then((r) => { setSoinsCount(r.totalCount); return r.items; }), setSoins);
      if (peut('PERSONNEL_VOIR')) {
        push(personnelService.getAll(1, 1).then((r) => r.totalCount), setPersonnelCount);
        push(personnelService.getStatistiques(), setPersonnelStats);
      }
      if (peut('HOSPITALISATIONS_VOIR')) push(hospitalisationService.getAll(1, 1).then((r) => r.totalCount), setHospitalisationsCount);

      const results = await Promise.allSettled(tasks);
      if (results.some((r) => r.status === 'rejected')) {
        toast.error('Certaines données du tableau de bord n\'ont pas pu être chargées');
      }
      setLoading(false);
    };
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtre]);

  if (loading) return <SkeletonCards cards={4} />;

  const dateLabel = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const examensEnAttente = examens.filter((e) => ['Prescrit', 'Planifié', 'En_cours'].includes(e.statut));
  const examensRealises = examens.filter((e) => ['Réalisé', 'Validé'].includes(e.statut));

  const cardsParRole: Record<string, StatCardDef[]> = {
    ADMIN: [
      { title: 'Patients', value: patientStats?.totalPatients ?? 0, sub: `${patientStats?.patientsRecents ?? 0} nouveaux (30j)`, icon: FaUserInjured, color: '#6366f1', href: '/patients' },
      { title: 'Médecins', value: medecinStats?.resume?.totalMedecins ?? 0, sub: 'Médecins inscrits', icon: FaUserMd, color: '#8b5cf6', href: '/medecins' },
      { title: 'Rendez-vous du jour', value: rdvStats?.aujourdhui ?? 0, sub: "Aujourd'hui", icon: FaCalendarCheck, color: '#10b981', href: '/rendezvous' },
      { title: 'Consultations ce mois', value: consultationStats?.consultationsMois ?? 0, sub: `${consultationStats?.total ?? 0} au total`, icon: FaStethoscope, color: '#0ea5e9', href: '/consultations' },
      { title: 'Hospitalisations', value: hospitalisationsCount, sub: 'Séjours enregistrés', icon: FaBed, color: '#14b8a6', href: '/hospitalisations' },
      { title: 'Alertes stock', value: alertesCount, sub: 'Non traitées', icon: FaExclamationTriangle, color: '#ef4444', href: '/pharmacie/alertes' },
      { title: 'Encaissé', value: `${(factureStats?.totalPaye ?? 0).toFixed(2)} $`, sub: `${factureStats?.totalFactures ?? 0} factures`, icon: FaWallet, color: '#22c55e', href: '/factures/statistiques' },
      { title: 'Reste dû', value: `${(factureStats?.totalRestant ?? 0).toFixed(2)} $`, sub: 'Total impayé', icon: FaMoneyBillWave, color: '#f43f5e', href: '/factures' },
    ],
    MEDECIN: [
      { title: 'Mes RDV du jour', value: rdvStats?.aujourdhui ?? 0, sub: 'Aujourd\'hui', icon: FaCalendarCheck, color: '#10b981', href: '/rendezvous' },
      { title: 'Consultations ce mois', value: consultationStats?.consultationsMois ?? 0, sub: 'Mois en cours', icon: FaStethoscope, color: '#6366f1', href: '/consultations' },
      { title: 'Examens à saisir', value: examensEnAttente.length, sub: 'Résultats en attente', icon: FaFlask, color: '#f59e0b', href: '/examens/liste' },
      { title: 'Examens réalisés', value: examensRealises.length, sub: 'Réalisés / validés', icon: FaMicroscope, color: '#14b8a6', href: '/examens/liste' },
      { title: 'Patients', value: patientStats?.totalPatients ?? 0, sub: `${patientStats?.patientsRecents ?? 0} récents`, icon: FaUserInjured, color: '#8b5cf6', href: '/patients' },
      { title: 'Hospitalisations', value: hospitalisationsCount, sub: 'Séjours en cours', icon: FaBed, color: '#0ea5e9', href: '/hospitalisations' },
    ],
    SECRETAIRE: [
      { title: 'Patients', value: patientStats?.totalPatients ?? 0, sub: `${patientStats?.patientsRecents ?? 0} récents`, icon: FaUserInjured, color: '#6366f1', href: '/patients' },
      { title: 'RDV du jour', value: rdvStats?.aujourdhui ?? 0, sub: "Aujourd'hui", icon: FaCalendarCheck, color: '#10b981', href: '/rendezvous' },
      { title: 'Médecins', value: medecinStats?.resume?.totalMedecins ?? 0, sub: 'Disponibles', icon: FaUserMd, color: '#8b5cf6', href: '/medecins' },
      { title: 'Factures en attente', value: factureStats?.parStatut?.find((s) => s.statut === 'En_attente')?.nombre ?? 0, sub: 'À encaisser', icon: FaFileInvoiceDollar, color: '#f59e0b', href: '/factures' },
      { title: 'Encaissé', value: `${(factureStats?.totalPaye ?? 0).toFixed(2)} $`, sub: 'Total perçu', icon: FaWallet, color: '#22c55e', href: '/factures/statistiques' },
      { title: 'Reste dû', value: `${(factureStats?.totalRestant ?? 0).toFixed(2)} $`, sub: 'Total impayé', icon: FaMoneyBillWave, color: '#ef4444', href: '/factures' },
    ],
    PHARMACIEN: [
      { title: 'Alertes non traitées', value: alertesCount, sub: 'Stock / péremption', icon: FaExclamationTriangle, color: '#ef4444', href: '/pharmacie/alertes' },
      { title: 'Délivrances', value: delivranceStats?.totalDelivrances ?? 0, sub: 'Total', icon: FaPills, color: '#6366f1', href: '/pharmacie/delivrances' },
      { title: 'Délivrances ce mois', value: delivranceStats?.delivrancesCeMois ?? 0, sub: 'Mois en cours', icon: FaCalendarCheck, color: '#10b981', href: '/pharmacie/delivrances' },
      { title: 'Montant délivré', value: `${(delivranceStats?.montantTotal ?? 0).toFixed(2)} $`, sub: 'Cumul', icon: FaMoneyBillWave, color: '#8b5cf6', href: '/pharmacie/delivrances' },
      { title: 'Marge totale', value: `${(marge?.margeTotale ?? 0).toFixed(2)} $`, sub: 'Sur délivrances', icon: FaWallet, color: '#22c55e', href: '/pharmacie/delivrances' },
      { title: 'Taux de marge', value: `${(marge?.tauxMargeTotal ?? 0).toFixed(1)} %`, sub: 'Moyenne', icon: FaPercentage, color: '#0ea5e9', href: '/pharmacie/delivrances' },
    ],
    INFIRMIER: [
      { title: 'Mes soins', value: soinsCount, sub: 'Réalisés', icon: FaUserNurse, color: '#6366f1', href: '/hospitalisations/soins' },
      { title: 'Soins récents', value: soins.length, sub: 'Derniers enregistrés', icon: FaStethoscope, color: '#10b981', href: '/hospitalisations/soins' },
      { title: 'Hospitalisations', value: hospitalisationsCount, sub: 'Séjours suivis', icon: FaBed, color: '#0ea5e9', href: '/hospitalisations' },
    ],
    LABORANTIN: [
      { title: 'Examens à saisir', value: examensEnAttente.length, sub: 'En attente de résultat', icon: FaMicroscope, color: '#f59e0b', href: '/examens/liste' },
      { title: 'Examens réalisés', value: examensRealises.length, sub: 'Réalisés / validés', icon: FaFlask, color: '#10b981', href: '/examens/liste' },
      { title: 'Total examens', value: examens.length, sub: 'Au total', icon: FaChartLine, color: '#6366f1', href: '/examens/liste' },
      { title: 'Patients', value: patientStats?.totalPatients ?? 0, sub: 'Patients suivis', icon: FaUserInjured, color: '#8b5cf6', href: '/patients' },
    ],
    RH: [
      { title: 'Personnel', value: personnelStats?.totalPersonnels ?? personnelCount, sub: 'Agents enregistrés', icon: FaUsers, color: '#6366f1', href: '/personnel' },
      { title: 'Médecins', value: medecinStats?.resume?.totalMedecins ?? 0, sub: 'Médecins inscrits', icon: FaUserMd, color: '#8b5cf6', href: '/medecins' },
      { title: 'Fonctions', value: personnelStats?.topFonctions?.length ?? 0, sub: 'Principales fonctions', icon: FaUserCheck, color: '#10b981', href: '/personnel' },
      { title: 'Hospitalisations', value: hospitalisationsCount, sub: 'Séjours enregistrés', icon: FaBed, color: '#14b8a6', href: '/hospitalisations' },
    ],
    PATIENT: [],
  };

  // La finance n'est visible que pour les rôles habilités (ADMIN, SECRETAIRE).
  const roleHabiliteFinance = role === 'ADMIN' || role === 'SECRETAIRE';
  const peutFinance = roleHabiliteFinance && peut('FACTURATION_VOIR');
  const financeTitles = new Set(['Factures en attente', 'Encaissé', 'Reste dû']);
  const cards = (cardsParRole[role ?? ''] ?? []).filter((c) => peutFinance || !financeTitles.has(c.title));

  return (
    <div className="space-y-5">
      {/* En-tête de page (style AdminLTE content-header) */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-800">Tableau de bord</h1>
          <nav className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
            <span>Accueil</span>
            <span>/</span>
            <span className="font-medium text-slate-500">{role ? roleLabels[role] ?? role : 'Centre hospitalier'}</span>
          </nav>
        </div>
        {(peut('CONSULTATIONS_VOIR') || peutFinance) && (
          <PeriodeFilter value={filtre} onChange={setFiltre} />
        )}
      </div>

      {/* KPI cards (fond blanc) */}
      {cards.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card, idx) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Link href={card.href ?? '#'} className="block">
                <div className="group relative overflow-hidden rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200/70 transition duration-200 hover:-translate-y-0.5 hover:shadow-md hover:ring-slate-300">
                  <span className="absolute inset-y-0 left-0 w-1" style={{ background: card.color }} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{card.title}</p>
                      <div className="mt-2 text-2xl font-semibold tabular-nums text-slate-900">{card.value}</div>
                      {card.sub && <p className="mt-1 text-xs text-slate-400">{card.sub}</p>}
                    </div>
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                      style={{ background: `${card.color}14`, color: card.color }}
                    >
                      <card.icon className="text-base" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Graphiques (ADMIN) */}
      {role === 'ADMIN' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ChartCard title="Évolution des consultations" icon={<FaStethoscope className="text-indigo-500" />} badge={`${consultationStats?.consultationsMois ?? 0} ce mois`}>
            {!consultationStats?.parMois?.length ? (
              <Empty icon={<FaStethoscope />} text="Aucune consultation enregistrée" />
            ) : (
              <AreaChart
                labels={consultationStats.parMois.map((m) => m.mois)}
                datasets={[{ label: 'Consultations', data: consultationStats.parMois.map((m) => m.nombre), color: '#6366f1' }]}
                height={280}
              />
            )}
          </ChartCard>

          <ChartCard title="Médecins par spécialité" icon={<FaHospital className="text-purple-500" />}>
            {!medecinStats?.parSpecialite?.length ? (
              <Empty icon={<FaUserMd />} text="Aucune donnée de spécialité" />
            ) : (
              <DonutChart
                labels={medecinStats.parSpecialite.map((s) => s.specialite)}
                datasets={[{ label: 'Médecins', data: medecinStats.parSpecialite.map((s) => s.nombreMedecins) }]}
                height={280}
              />
            )}
          </ChartCard>
        </div>
      )}

      {/* Graphiques complémentaires */}
      {(() => {
        const parMoisConsult = consultationStats?.parMois ?? [];
        const parMoisFacture = factureStats?.parMois ?? [];
        const showConsult = role === 'MEDECIN' && parMoisConsult.length > 0;
        const showFacture = peutFinance && parMoisFacture.length > 0;
        if (!showConsult && !showFacture) return null;
        return (
        <div className={`grid grid-cols-1 gap-6 ${showConsult && showFacture ? 'lg:grid-cols-2' : ''}`}>
          {showConsult && (
            <ChartCard title="Évolution de mes consultations" icon={<FaChartLine className="text-indigo-500" />} badge={`${consultationStats?.consultationsMois ?? 0} ce mois`}>
              <AreaChart
                labels={parMoisConsult.map((m) => m.mois)}
                datasets={[{ label: 'Consultations', data: parMoisConsult.map((m) => m.nombre), color: '#0ea5e9' }]}
                height={260}
              />
            </ChartCard>
          )}

          {showFacture && (
            <ChartCard title="Facturation par mois" icon={<FaFileInvoiceDollar className="text-emerald-500" />} badge={`${(factureStats?.totalPaye ?? 0).toFixed(0)} $ encaissés`}>
              <BarChart
                labels={parMoisFacture.map((m) => m.mois)}
                datasets={[{ label: 'Montant', data: parMoisFacture.map((m) => m.montant), color: '#10b981' }]}
                height={260}
                currency
              />
            </ChartCard>
          )}
        </div>
        );
      })()}

      {/* Sections spécifiques */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {peut('RENDEZ_VOUS_VOIR') && (
          <ListCard
            title={role === 'MEDECIN' ? 'Mes rendez-vous du jour' : 'Rendez-vous du jour'}
            icon={<FaCalendarCheck className="text-emerald-500" />}
            badge={`${rdvDuJour.length}`}
            href="/rendezvous"
            empty="Aucun rendez-vous aujourd'hui"
          >
            {rdvDuJour.slice(0, 6).map((rdv) => {
              const time = rdv.dateRdv ? new Date(rdv.dateRdv).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '';
              return (
                <Row key={rdv.idRdv} icon={<FaUserInjured />} color="#10b981"
                  title={`${rdv.medecinPrenom ?? ''} ${rdv.medecinNom ?? ''}`}
                  sub={`${rdv.patientPrenom ?? ''} ${rdv.patientNom ?? ''}${rdv.medecinSpecialite ? ` • ${rdv.medecinSpecialite}` : ''}`}
                  right={time} />
              );
            })}
          </ListCard>
        )}

        {peut('PHARMACIE_VOIR') && (
          <ListCard
            title="Alertes stock"
            icon={<FaExclamationTriangle className="text-rose-500" />}
            badge={`${alertesCount} non traitées`}
            href="/pharmacie/alertes"
            empty="Aucune alerte stock en cours"
          >
            {alertes.slice(0, 6).map((a) => (
              <Row key={a.idAlerte} icon={<FaPills />} color="#ef4444"
                title={a.medicamentNom ?? 'Médicament'}
                sub={AlerteTypeLabels[a.typeAlerte] ?? a.typeAlerte}
                right="Urgent" />
            ))}
          </ListCard>
        )}

        {peut('EXAMENS_VOIR') && (
          <ListCard
            title="Examens à saisir"
            icon={<FaFlask className="text-amber-500" />}
            badge={`${examensEnAttente.length}`}
            href="/examens/liste"
            empty="Aucun examen en attente de résultat"
          >
            {examensEnAttente.slice(0, 6).map((e) => (
              <Row key={e.idExamen} icon={<FaMicroscope />} color="#f59e0b"
                title={e.typeExamen}
                sub={`${e.patientNom ?? ''} • ${e.libelleCategorie ?? ''}`}
                right={e.statut} />
            ))}
          </ListCard>
        )}

        {peut('SOINS_VOIR') && (
          <ListCard
            title={role === 'INFIRMIER' ? 'Mes soins récents' : 'Soins récents'}
            icon={<FaUserNurse className="text-indigo-500" />}
            badge={`${soinsCount}`}
            href="/hospitalisations/soins"
            empty="Aucun soin enregistré"
          >
            {soins.slice(0, 6).map((s) => (
              <Row key={s.idSoin} icon={<FaUserNurse />} color="#6366f1"
                title={s.typeSoin}
                sub={s.patientNom ?? s.description ?? ''}
                right={s.dateSoin ? new Date(s.dateSoin).toLocaleDateString('fr-FR') : ''} />
            ))}
          </ListCard>
        )}

        {peutFinance && factureStats && (
          <Card className="h-full rounded-2xl">
            <Card.Header className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-800"><FaFileInvoiceDollar className="text-emerald-500" /> Facturation</span>
              <Link href="/factures/statistiques" className="text-xs text-indigo-600 hover:underline">Détails</Link>
            </Card.Header>
            <Card.Body className="grid grid-cols-2 gap-4">
              <Money label="Total émis" value={factureStats.totalMontantEmis} />
              <Money label="Encaissé" value={factureStats.totalPaye} color="text-emerald-600" />
              <Money label="Reste dû" value={factureStats.totalRestant} color="text-rose-600" />
              <Money label="Factures" value={factureStats.totalFactures} money={false} />
            </Card.Body>
          </Card>
        )}

        {peut('PHARMACIE_VOIR') && !!marge?.parMedicament?.length && (
          <ListCard
            title="Top médicaments délivrés"
            icon={<FaBoxes className="text-sky-500" />}
            badge={`${marge?.parMedicament?.length ?? 0}`}
            href="/pharmacie/delivrances"
            empty="Aucune délivrance sur la période"
          >
            {[...(marge?.parMedicament ?? [])].sort((a, b) => b.marge - a.marge).slice(0, 6).map((m) => (
              <Row key={m.idMedicament} icon={<FaPills />} color="#0ea5e9"
                title={m.nomMedicament}
                sub={`${m.quantiteDelivree} délivrés • CA ${m.chiffreAffaires.toFixed(2)} $`}
                right={`${m.marge.toFixed(2)} $`} />
            ))}
          </ListCard>
        )}

        {peut('PERSONNEL_VOIR') && !!personnelStats?.topFonctions?.length && (
          <ListCard
            title="Personnel par fonction"
            icon={<FaUserCheck className="text-teal-500" />}
            badge={`${personnelStats?.totalPersonnels ?? personnelCount}`}
            href="/personnel"
            empty="Aucun personnel enregistré"
          >
            {(personnelStats?.topFonctions ?? []).map((f) => (
              <Row key={f.fonction} icon={<FaClipboardList />} color="#14b8a6"
                title={f.fonction} sub="Effectif" right={`${f.effectif}`} />
            ))}
          </ListCard>
        )}
      </div>
    </div>
  );
};

function ChartCard({ title, icon, badge, children }: { title: string; icon: React.ReactNode; badge?: string; children: React.ReactNode }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">{icon} {title}</span>
        {badge && (
          <span className="rounded bg-white px-2 py-0.5 text-xs font-medium tabular-nums text-slate-500 ring-1 ring-slate-200">{badge}</span>
        )}
      </div>
      <div className="flex-1 p-4">{children}</div>
    </div>
  );
}

function ListCard({ title, icon, badge, href, empty, children }: { title: string; icon: React.ReactNode; badge?: string; href: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [];
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">{icon} {title}</span>
        {badge && <span className="rounded bg-white px-2 py-0.5 text-xs font-medium tabular-nums text-slate-500 ring-1 ring-slate-200">{badge}</span>}
      </div>
      <div className="flex flex-1 flex-col p-4">
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 py-10 text-center">
            <FaClock className="text-4xl text-slate-200" />
            <p className="text-sm text-slate-400">{empty}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">{children}</div>
        )}
        <div className="mt-auto border-t border-slate-100 pt-3">
          <Link href={href} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800">
            Voir tout <FaArrowRight size={11} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ icon, color, title, sub, right }: { icon: React.ReactNode; color: string; title: string; sub?: string; right?: string }) {
  return (
    <div className="flex items-center gap-3 py-3 transition hover:bg-slate-50/70">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs"
        style={{ background: `${color}14`, color }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-slate-800">{title}</p>
        {sub && <p className="truncate text-xs text-slate-500">{sub}</p>}
      </div>
      {right && (
        <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold tabular-nums text-slate-600">{right}</span>
      )}
    </div>
  );
}

function Empty({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <span className="text-4xl text-slate-200">{icon}</span>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function Money({ label, value, color = 'text-slate-800', money = true }: { label: string; value: number; color?: string; money?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      <p className={`text-xl font-bold ${color}`}>{money ? `${value.toFixed(2)} $` : value}</p>
    </div>
  );
}

export default Dashboard;
