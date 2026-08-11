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
import PageHeader from '@/app/ui/PageHeader';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import { specialiteService } from '@/app/services/specialiteService';
import type { Specialite } from '@/app/types/specialite';
import type { Medecin } from '@/app/types/medecin';
import type { Chambre } from '@/app/types/chambre';

const getDisponibiliteColor = (d?: string) => {
  switch (d) {
    case 'Disponible':
      return 'bg-green-100 text-green-800';
    case 'EnConge':
      return 'bg-amber-100 text-amber-800';
    case 'Absent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatutChambreColor = (s?: string) => {
  switch (s) {
    case 'Disponible':
      return 'bg-green-100 text-green-800';
    case 'Occupee':
    case 'Reservee':
      return 'bg-red-100 text-red-800';
    case 'En_nettoyage':
    case 'Hors_service':
      return 'bg-amber-100 text-amber-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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
    <div className="space-y-6">
      <PageHeader
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
      />

      {/* Carte principale */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
                <FaStethoscope className="text-3xl" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{specialite.nomSpecialite}</h1>
                <p className="mt-1 flex items-center gap-2 text-white/80">
                  {specialite.chefService ? <><FaUserTie /> {specialite.chefService}</> : 'Aucun chef de service'}
                </p>
              </div>
            </div>
            <span className={`inline-flex items-center rounded-full px-4 py-1.5 text-xs font-bold uppercase ${specialite.actif ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
              {specialite.actif ? <><FaCheckCircle className="mr-1" /> Actif</> : <><FaTimesCircle className="mr-1" /> Inactif</>}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 divide-y divide-gray-100 md:grid-cols-3 md:divide-x">
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600">{medecins.length}</div>
            <div className="mt-1 text-sm text-gray-500 flex items-center justify-center gap-1"><FaUserMd /> Médecins</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">{chambres.length}</div>
            <div className="mt-1 text-sm text-gray-500 flex items-center justify-center gap-1"><FaBed /> Chambres</div>
          </div>
          <div className="p-6 text-center">
            <div className="text-3xl font-bold text-emerald-600">{specialite.actif ? 'Actif' : 'Inactif'}</div>
            <div className="mt-1 text-sm text-gray-500 flex items-center justify-center gap-1"><FaClipboardList /> Statut</div>
          </div>
        </div>
      </div>

      {/* Onglets */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 rounded-t-lg px-4 py-2 font-medium transition ${
              activeTab === tab.key
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'infos' && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b font-semibold text-gray-800">
              <FaBuilding className="inline mr-1 text-indigo-500" /> Informations
            </div>
            <div className="p-5 space-y-3">
              <InfoRow icon={<FaUserTie />} label="Chef de service" value={specialite.chefService || '-'} />
              <InfoRow icon={<FaPhone />} label="Téléphone" value={specialite.telephoneService || '-'} />
              <InfoRow icon={<FaEnvelope />} label="Email" value={specialite.emailService || '-'} />
              <InfoRow icon={<FaCalendarAlt />} label="Date de création" value={specialite.dateCreation ? new Date(specialite.dateCreation).toLocaleDateString('fr-FR') : '-'} />
              <InfoRow icon={<FaDoorOpen />} label="Statut" value={specialite.actif ? 'Actif' : 'Inactif'} />
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b font-semibold text-gray-800">
              <FaClipboardList className="inline mr-1 text-indigo-500" /> Description
            </div>
            <div className="p-5">
              <p className="text-gray-700 leading-relaxed">{specialite.description || 'Aucune description.'}</p>
            </div>
          </div>
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
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getDisponibiliteColor(m.disponibilite)}`}>
                        {m.disponibilite === 'EnConge' ? 'En congé' : m.disponibilite}
                      </span>
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
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatutChambreColor(c.statut)}`}>
                        {c.statut || '-'}
                      </span>
                    </Td>
                    <Td className="whitespace-nowrap text-gray-600">{c.prixJour ? `${c.prixJour} €` : '-'}</Td>
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
    </div>
  );
};

const InfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="mt-0.5 text-gray-400">{icon}</div>
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default SpecialiteDetails;
