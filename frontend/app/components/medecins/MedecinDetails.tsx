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
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
const BASE_URL = API_URL?.replace('/api', '') || 'http://localhost:7034';

// Helpers
const getImageUrl = (photo?: string | null): string | null => {
  if (!photo) return null;
  if (photo.startsWith('http') || photo.startsWith('blob:')) return photo;
  if (photo.startsWith('/uploads')) return `${BASE_URL}${photo}`;
  return photo;
};

const getDisponibiliteColor = (d?: string) => {
  switch (d) {
    case 'Disponible':
      return 'bg-green-100 text-green-800';
    case 'En congé':
      return 'bg-amber-100 text-amber-800';
    case 'Absent':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
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

  return (
    <PageShell
      title="Détails du médecin"
      subtitle={`${p?.prenom} ${p?.nom} • ${pr?.specialite || 'Spécialité non précisée'}`}
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
      {/* Carte profil */}
      <DetailBanner
        title={`Dr. ${p?.prenom} ${p?.nom}`}
        subtitle={pr?.specialite}
        meta="Médecin"
        badges={
          <>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm">
              <FaIdCard size={12} /> {p?.matricule}
            </span>
            {pr?.qualification && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-3 py-1 text-sm">
                <FaGraduationCap size={12} /> {pr?.qualification}
              </span>
            )}
            <span className={`rounded-full px-3 py-1 text-sm font-medium ${getDisponibiliteColor(pr?.disponibilite)}`}>
              {pr?.disponibilite}
            </span>
          </>
        }
      >
        <div className="flex flex-col gap-8 p-6 lg:flex-row">
          {/* Photo */}
          <div className="flex justify-center lg:block">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-slate-100 bg-indigo-50 flex items-center justify-center">
              {p?.photo ? (
                <img
                  src={getImageUrl(p.photo) ?? ''}
                  alt={`${p.prenom} ${p.nom}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FaUserMd className="text-4xl text-indigo-500" />
              )}
            </div>
          </div>

          {/* Stats rapides */}
          <div className="flex-1">
            <div className="bg-slate-50 rounded-xl p-4 flex justify-around gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats?.totalConsultations ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase">Consultations</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats?.totalRendezVous ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase">RDV</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats?.rendezVousAVenir ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase">À venir</div>
              </div>
            </div>
          </div>
        </div>
      </DetailBanner>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button
          onClick={() => setActiveTab('infos')}
          className={`px-4 py-2 font-medium rounded-t-lg transition ${
            activeTab === 'infos'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Informations
        </button>
        <button
          onClick={() => setActiveTab('rdv')}
          className={`px-4 py-2 font-medium rounded-t-lg transition ${
            activeTab === 'rdv'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Rendez-vous
        </button>
      </div>

      {/* Contenu des onglets */}
      {activeTab === 'infos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Informations personnelles */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b font-semibold text-gray-800">
              Informations personnelles
            </div>
            <InfoGrid>
              <InfoCard icon={FaUser} label="Nom" value={p?.nom} />
              <InfoCard icon={FaUser} label="Prénom" value={p?.prenom} />
              <InfoCard icon={FaEnvelope} label="Email" value={p?.email || '-'} />
              <InfoCard icon={FaPhone} label="Téléphone" value={p?.telephone || '-'} />
              <InfoCard icon={FaMapMarkerAlt} label="Adresse" value={p?.adresse || '-'} />
            </InfoGrid>
          </div>

          {/* Informations professionnelles */}
          <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b font-semibold text-gray-800">
              Informations professionnelles
            </div>
            <InfoGrid>
              <InfoCard icon={FaBuilding} label="Spécialité" value={pr?.specialite || '-'} />
              <InfoCard icon={FaGraduationCap} label="Diplôme" value={pr?.diplome || '-'} />
              <InfoCard icon={FaGraduationCap} label="Qualification" value={pr?.qualification || '-'} />
              <InfoCard icon={FaMoneyBillWave} label="Salaire" value={pr?.salaire ? `${pr.salaire} $` : '-'} />
            </InfoGrid>
          </div>
        </div>
      )}

      {activeTab === 'rdv' && (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Date</Th>
                <Th>Patient</Th>
                <Th>Statut</Th>
              </tr>
            </THead>
            <TBody>
              {medecin.rendezVousAVenir?.length ? (
                medecin.rendezVousAVenir.map((r) => (
                  <Tr key={r.idRdv}>
                    <Td className="whitespace-nowrap">
                      {new Date(r.dateRdv).toLocaleString('fr-FR')}
                    </Td>
                    <Td className="whitespace-nowrap">{r.patient}</Td>
                    <Td className="whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {r.statut}
                      </span>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={3}>
                    <div className="py-8 text-center text-gray-500">Aucun rendez-vous</div>
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

export default MedecinDetails;
