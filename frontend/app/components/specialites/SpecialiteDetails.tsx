'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaBuilding, FaUserMd, FaBed, FaPhone, FaEnvelope,
  FaClipboardList, FaUserTie, FaCalendarAlt, FaCheckCircle, FaTimesCircle,
  FaEdit, FaTrash, FaStethoscope, FaDoorOpen
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';
import PageShell from '@/app/ui/PageShell';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import { specialiteService } from '@/app/services/specialiteService';
import type { Specialite } from '@/app/types/specialite';
import type { Medecin } from '@/app/types/medecin';
import type { Chambre } from '@/app/types/chambre';

const DISPO_COLORS: Record<string, string> = {
  Disponible: '#10b981',
  EnConge: '#facc15',
  'En congé': '#facc15',
  Absent: '#7c3aed',
  EnFormation: '#ec4899',
  'En formation': '#ec4899',
};

const DISPO_LABELS: Record<string, string> = {
  Disponible: 'Disponible',
  EnConge: 'En congé',
  'En congé': 'En congé',
  Absent: 'Absent',
  EnFormation: 'En formation',
  'En formation': 'En formation',
};

const CHAMBRE_COLORS: Record<string, string> = {
  Disponible: '#10b981',
  Occupee: '#7c3aed',
  Reservee: '#f59e0b',
  En_nettoyage: '#f59e0b',
  Hors_service: '#ef4444',
};

const CHAMBRE_LABELS: Record<string, string> = {
  Disponible: 'Disponible',
  Occupee: 'Occupée',
  Reservee: 'Réservée',
  En_nettoyage: 'En nettoyage',
  Hors_service: 'Hors service',
};

function Badge({ value, colors, labels }: { value?: string; colors: Record<string, string>; labels: Record<string, string> }) {
  const color = colors[value ?? ''] ?? '#64748b';
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium"
      style={{ background: `${color}14`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {labels[value ?? ''] ?? value ?? '-'}
    </span>
  );
}

const SpecialiteDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const confirm = useConfirm();

  const [specialite, setSpecialite] = useState<Specialite | null>(null);
  const [medecins, setMedecins] = useState<Medecin[]>([]);
  const [chambres, setChambres] = useState<Chambre[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'infos' | 'medecins' | 'chambres'>('infos');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      specialiteService.getById(Number(id)),
      specialiteService.getMedecinsBySpecialite(Number(id), { pageSize: 100 }),
      specialiteService.getChambresBySpecialite(Number(id), { pageSize: 100 }),
    ])
      .then(([spec, med, chm]) => {
        setSpecialite(spec);
        setMedecins(med.items);
        setChambres(chm.items);
      })
      .catch(() => toast.error('Erreur lors du chargement de la spécialité'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Confirmation de suppression',
      message: `Supprimer la spécialité "${specialite?.nomSpecialite}" ? Cette action est irréversible.`,
      confirmText: 'Oui, supprimer',
      cancelText: 'Annuler',
      confirmColor: '#d33',
    });
    if (!ok) return;
    try {
      await specialiteService.delete(Number(id));
      toast.success('Spécialité supprimée');
      router.push('/specialites');
    } catch {
      toast.error('Impossible de supprimer la spécialité');
    }
  };

  if (loading) return <SkeletonDetails />;

  if (!specialite) {
    return (
      <EmptyState
        icon={<FaStethoscope />}
        title="Spécialité introuvable"
        description="La spécialité demandée n'existe pas ou a été supprimée."
        action={<Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/specialites')}>Retour</Button>}
      />
    );
  }

  const tabs = [
    { key: 'infos' as const, label: 'Informations', icon: FaBuilding },
    { key: 'medecins' as const, label: `Médecins (${medecins.length})`, icon: FaUserMd },
    { key: 'chambres' as const, label: `Chambres (${chambres.length})`, icon: FaBed },
  ];

  return (
    <PageShell
      title={specialite.nomSpecialite}
      subtitle="Détails de la spécialité"
      actions={
        <>
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/specialites')}>
            Retour
          </Button>
          <Button icon={<FaEdit />} onClick={() => router.push(`/specialites/${id}/modifier`)}>
            Modifier
          </Button>
          <Button variant="danger" icon={<FaTrash />} onClick={handleDelete}>
            Supprimer
          </Button>
        </>
      }
    >
      {/* Carte principale (style AdminLTE) */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-slate-200">
        <div className="relative h-24 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                'radial-gradient(circle at 20% 120%, rgba(99,102,241,0.6), transparent 50%), radial-gradient(circle at 80% -20%, rgba(14,165,233,0.5), transparent 50%)',
            }}
          />
        </div>
        <div className="grid grid-cols-1 gap-6 px-6 pb-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div
                className="relative z-10 -mt-16 mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-white text-indigo-500 ring-4 ring-white"
                style={{ boxShadow: '0 4px 14px rgba(15,23,42,0.15)' }}
              >
                <FaBuilding className="text-3xl" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">{specialite.nomSpecialite}</h2>
              <p className="text-sm text-slate-500">
                {specialite.chefService ? `Chef de service : ${specialite.chefService}` : 'Aucun chef de service'}
              </p>
              <span
                className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium"
                style={{
                  background: specialite.actif ? '#10b98114' : '#ef444414',
                  color: specialite.actif ? '#059669' : '#dc2626',
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: specialite.actif ? '#10b981' : '#ef4444' }} />
                {specialite.actif ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>

          <div className="lg:col-span-8">
            <div className="grid grid-cols-3 gap-3 border-b border-slate-100 py-4">
              {[
                { label: 'Médecins', value: medecins.length, color: '#6366f1', icon: FaUserMd },
                { label: 'Chambres', value: chambres.length, color: '#8b5cf6', icon: FaBed },
                { label: 'Statut', value: specialite.actif ? 'Actif' : 'Inactif', color: specialite.actif ? '#10b981' : '#ef4444', icon: FaClipboardList },
              ].map((kpi) => (
                <div key={kpi.label} className="rounded-lg border border-slate-100 bg-slate-50 px-4 py-3 text-center">
                  <p className="text-2xl font-semibold tabular-nums" style={{ color: kpi.color }}>{kpi.value}</p>
                  <p className="mt-0.5 flex items-center justify-center gap-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    <kpi.icon size={10} /> {kpi.label}
                  </p>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Coordonnées</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <InfoLine icon={FaPhone} label="Téléphone" value={specialite.telephoneService} />
                <InfoLine icon={FaEnvelope} label="Email" value={specialite.emailService} />
                <InfoLine
                  icon={FaCalendarAlt}
                  label="Création"
                  value={specialite.dateCreation ? new Date(specialite.dateCreation).toLocaleDateString('fr-FR') : '-'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Onglets (nav-tabs AdminLTE) */}
      <div className="border-b border-slate-200">
        <nav className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                activeTab === tab.key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <tab.icon size={13} /> {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'infos' && (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Panel title="Informations" icon={<FaBuilding className="text-indigo-500" />}>
            <Field label="Chef de service" value={specialite.chefService} />
            <Field label="Téléphone" value={specialite.telephoneService} />
            <Field label="Email" value={specialite.emailService} />
            <Field label="Date de création" value={specialite.dateCreation ? new Date(specialite.dateCreation).toLocaleDateString('fr-FR') : '-'} />
            <Field label="Statut" value={specialite.actif ? 'Actif' : 'Inactif'} />
          </Panel>

          <Panel title="Description" icon={<FaClipboardList className="text-indigo-500" />}>
            <div className="py-3">
              <p className="leading-relaxed text-slate-600">{specialite.description || 'Aucune description.'}</p>
            </div>
          </Panel>
        </div>
      )}

      {activeTab === 'medecins' && (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Médecin</Th>
                <Th>Matricule</Th>
                <Th>Contact</Th>
                <Th>Disponibilité</Th>
              </tr>
            </THead>
            <TBody>
              {medecins.length > 0 ? (
                medecins.map((m) => (
                  <Tr key={m.idMedecin} onClick={() => router.push(`/medecins/${m.idMedecin}/details`)}>
                    <Td className="whitespace-nowrap font-medium text-gray-900">
                      Dr. {m.prenom} {m.nom}
                    </Td>
                    <Td className="whitespace-nowrap text-gray-600">{m.matricule}</Td>
                    <Td className="whitespace-nowrap text-gray-600">{m.telephone || m.email || '-'}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge value={m.disponibilite} colors={DISPO_COLORS} labels={DISPO_LABELS} />
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={4}>
                    <EmptyState icon={<FaUserMd />} title="Aucun médecin" description="Aucun médecin rattaché à cette spécialité." />
                  </Td>
                </Tr>
              )}
            </TBody>
          </Table>
        </TableContainer>
      )}

      {activeTab === 'chambres' && (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Numéro</Th>
                <Th>Bâtiment</Th>
                <Th>Étage</Th>
                <Th>Type</Th>
                <Th>Statut</Th>
                <Th>Prix/jour</Th>
              </tr>
            </THead>
            <TBody>
              {chambres.length > 0 ? (
                chambres.map((c) => (
                  <Tr key={c.idChambre} onClick={() => router.push(`/hospitalisations/chambres/${c.idChambre}/details`)}>
                    <Td className="whitespace-nowrap font-medium text-gray-900">{c.numeroChambre}</Td>
                    <Td className="whitespace-nowrap text-gray-600">{c.batiment || '-'}</Td>
                    <Td className="whitespace-nowrap text-gray-600">{c.etage ?? '-'}</Td>
                    <Td className="whitespace-nowrap text-gray-600">{c.typeChambre || '-'}</Td>
                    <Td className="whitespace-nowrap">
                      <Badge value={c.statut} colors={CHAMBRE_COLORS} labels={CHAMBRE_LABELS} />
                    </Td>
                    <Td className="whitespace-nowrap text-gray-600">{c.prixJour ? `${c.prixJour} $` : '-'}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={6}>
                    <EmptyState icon={<FaBed />} title="Aucune chambre" description="Aucune chambre rattachée à cette spécialité." />
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

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-right text-sm font-medium text-slate-700">{value || '-'}</span>
    </div>
  );
}

export default SpecialiteDetails;
