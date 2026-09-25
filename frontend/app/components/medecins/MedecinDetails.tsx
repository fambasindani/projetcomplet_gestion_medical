// components/medecins/MedecinDetails.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft,
  FaBuilding,
  FaEnvelope,
  FaGraduationCap,
  FaIdCard,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaUser,
  FaUserMd,
  FaEdit,
} from 'react-icons/fa';
import { medecinService } from '@/app/services/medecinService';
import type { MedecinDetails } from '@/app/types/medecin';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import Button from '@/app/ui/Button';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = API_URL?.replace('/api', '') || 'http://localhost:7035';

// Helpers
const getImageUrl = (photo?: string | null): string | null => {
  if (!photo) return null;
  if (photo.startsWith('http') || photo.startsWith('blob:')) return photo;
  if (photo.startsWith('/uploads')) return `${BASE_URL}${photo}`;
  return photo;
};

const DISPO_COLORS: Record<string, string> = {
  Disponible: '#10b981',
  'En congé': '#facc15',
  EnConge: '#facc15',
  Absent: '#7c3aed',
  'En formation': '#ec4899',
  EnFormation: '#ec4899',
};

const DISPO_LABELS: Record<string, string> = {
  Disponible: 'Disponible',
  'En congé': 'En congé',
  EnConge: 'En congé',
  Absent: 'Absent',
  'En formation': 'En formation',
  EnFormation: 'En formation',
};

const MedecinDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [medecin, setMedecin] = useState<MedecinDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'infos' | 'rdv'>('infos');

  useEffect(() => {
    const loadMedecin = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const data = await medecinService.getDetails(Number(id));
        setMedecin(data);
      } catch (err) {
        console.error(err);
        toast.error('Erreur lors du chargement du médecin');
        router.push('/medecins');
      } finally {
        setLoading(false);
      }
    };
    loadMedecin();
  }, [id, router]);

  if (loading) {
    return <SkeletonDetails />;
  }

  if (!medecin) return null;

  const p = medecin.informationsPersonnelles;
  const pr = medecin.informationsProfessionnelles;
  const stats = medecin.statistiques;
  // Tous les rendez-vous (passés + à venir) ; repli sur les à-venir si absent.
  const listeRdv = medecin.tousLesRendezVous?.length
    ? medecin.tousLesRendezVous
    : medecin.rendezVousAVenir ?? [];

  const dispoColor = DISPO_COLORS[pr?.disponibilite ?? ''] ?? '#94a3b8';
  const dispoLabel = DISPO_LABELS[pr?.disponibilite ?? ''] ?? pr?.disponibilite ?? '—';

  const kpis = [
    { label: 'Consultations', value: stats?.totalConsultations ?? 0, color: '#6366f1' },
    { label: 'Rendez-vous', value: stats?.totalRendezVous ?? 0, color: '#0ea5e9' },
    { label: 'À venir', value: stats?.rendezVousAVenir ?? 0, color: '#10b981' },
  ];

  return (
    <PageShell
      title="Détails du médecin"
      subtitle={`${p?.prenom ?? ''} ${p?.nom ?? ''} • ${pr?.specialite || 'Spécialité non précisée'}`}
      actions={
        <>
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/medecins')}>
            Retour
          </Button>
          <Button icon={<FaEdit />} onClick={() => router.push(`/medecins/${id}/modifier`)}>
            Modifier
          </Button>
        </>
      }
    >
      {/* Carte profil (style AdminLTE widget-user) */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="relative h-28 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 120%, rgba(99,102,241,0.6), transparent 50%), radial-gradient(circle at 80% -20%, rgba(14,165,233,0.5), transparent 50%)',
            }}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-12">
          {/* Photo + identité */}
          <div className="lg:col-span-4">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div
                className="relative z-10 -mt-20 mb-3 h-28 w-28 overflow-hidden rounded-full bg-white flex items-center justify-center ring-4 ring-white"
                style={{ boxShadow: '0 4px 14px rgba(15,23,42,0.15)' }}
              >
                {p?.photo ? (
                  <img src={getImageUrl(p.photo) ?? ''} alt={`${p.prenom} ${p.nom}`} className="h-full w-full object-cover" />
                ) : (
                  <FaUserMd className="text-4xl text-slate-400" />
                )}
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Dr. {p?.prenom} {p?.nom}</h2>
              <p className="text-sm text-slate-500">{pr?.specialite || 'Spécialité non précisée'}</p>
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
                style={{ background: `${dispoColor}14`, color: dispoColor }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: dispoColor }} />
                {dispoLabel}
              </span>
              <div className="mt-4 w-full space-y-2 border-t border-slate-100 pt-4 text-sm">
                <p className="flex items-center justify-between text-slate-500">
                  <span>Matricule</span>
                  <span className="font-medium text-slate-700">{p?.matricule || '-'}</span>
                </p>
                <p className="flex items-center justify-between text-slate-500">
                  <span>Qualification</span>
                  <span className="font-medium text-slate-700">{pr?.qualification || '-'}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Informations + KPI */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-3 gap-3 border-b border-slate-100 py-4">
              {kpis.map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-2xl font-semibold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">{kpi.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Coordonnées</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoLine icon={FaEnvelope} label="Email" value={p?.email || '-'} />
                <InfoLine icon={FaPhone} label="Téléphone" value={p?.telephone || '-'} />
                <InfoLine icon={FaMapMarkerAlt} label="Adresse" value={p?.adresse || '-'} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets (style nav-tabs AdminLTE) */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-1">
          {[
            { key: 'infos' as const, label: 'Informations' },
            { key: 'rdv' as const, label: `Rendez-vous (${listeRdv.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'infos' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Panel title="Informations personnelles" icon={<FaUser className="text-indigo-500" />}>
            <Field label="Nom" value={p?.nom} />
            <Field label="Prénom" value={p?.prenom} />
            <Field label="Email" value={p?.email} />
            <Field label="Téléphone" value={p?.telephone} />
            <Field label="Adresse" value={p?.adresse} />
          </Panel>

          <Panel title="Informations professionnelles" icon={<FaBuilding className="text-indigo-500" />}>
            <Field label="Spécialité" value={pr?.specialite} icon={FaBuilding} />
            <Field label="Diplôme" value={pr?.diplome} icon={FaGraduationCap} />
            <Field label="Qualification" value={pr?.qualification} icon={FaGraduationCap} />
            <Field label="Salaire" value={pr?.salaire ? `${pr.salaire} $` : '-'} icon={FaMoneyBillWave} />
            <Field label="Disponibilité" value={dispoLabel} icon={FaIdCard} />
          </Panel>
        </div>
      )}

      {activeTab === 'rdv' && (
        <TableContainer>
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-3.5">
            <h5 className="text-sm font-semibold text-slate-700">Rendez-vous</h5>
            <span className="rounded bg-white px-2 py-0.5 text-xs font-medium text-slate-500 ring-1 ring-slate-200">
              {listeRdv.length}
            </span>
          </div>
          <Table>
            <THead>
              <tr>
                <Th>Date</Th>
                <Th>Patient</Th>
                <Th align="center">Échéance</Th>
                <Th align="center">Statut</Th>
              </tr>
            </THead>
            <TBody>
              {listeRdv.length ? (
                listeRdv.map((r) => {
                  const date = new Date(r.dateRdv);
                  const passe = date.getTime() < Date.now();
                  return (
                    <Tr key={r.idRdv}>
                      <Td className="whitespace-nowrap">{date.toLocaleString('fr-FR')}</Td>
                      <Td className="whitespace-nowrap">{r.patient}</Td>
                      <Td className="whitespace-nowrap text-center">
                        <span className={`rounded-md px-2 py-1 text-xs font-medium ${
                          passe ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {passe ? 'Passé' : 'À venir'}
                        </span>
                      </Td>
                      <Td className="whitespace-nowrap text-center">
                        <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
                          {r.statut}
                        </span>
                      </Td>
                    </Tr>
                  );
                })
              ) : (
                <Tr>
                  <Td colSpan={4}>
                    <div className="py-10 text-center text-sm text-slate-400">Aucun rendez-vous</div>
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </PageShell>
  );
};

function InfoLine({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value?: string | null }) {
  return (
    <div className="flex items-start gap-2.5 rounded-lg border border-slate-100 bg-white px-3 py-2.5">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        <Icon size={12} />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
        <p className="truncate text-sm text-slate-700">{value || '-'}</p>
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
        <h5 className="text-sm font-semibold text-slate-700">{icon} {title}</h5>
      </div>
      <div className="divide-y divide-slate-100 px-5">{children}</div>
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon className="text-slate-300" size={12} />}
        {label}
      </span>
      <span className="text-right text-sm font-medium text-slate-700">{value || '-'}</span>
    </div>
  );
};

export default MedecinDetails;
