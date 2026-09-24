'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaCalendarAlt, FaIdCard, FaUser, FaUserTie, FaMoneyBillWave
} from 'react-icons/fa';
import { personnelService } from '@/app/services/personnelService';
import type { PersonnelResponse } from '@/app/types/personnel';
import { GenreLabels, TypeContratLabels } from '@/app/types/personnel';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import Button from '@/app/ui/Button';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';

export default function PersonnelDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [personnel, setPersonnel] = useState<PersonnelResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    personnelService.getById(Number(id))
      .then(setPersonnel)
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (!personnel) return <div className="p-10 text-center text-gray-500">Personnel introuvable.</div>;

  return (
    <PageShell
      title="Détails du personnel"
      subtitle={`${personnel.fonction} • ${personnel.service || 'Service non précisé'}`}
      actions={
        <>
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/personnel')}>
            Retour
          </Button>
          <Button icon={<FaEdit />} onClick={() => router.push(`/personnel/${id}/modifier`)}>
            Modifier
          </Button>
        </>
      }
    >
      <DetailBanner
        title={`${personnel.nom} ${personnel.prenom}`}
        subtitle={`${personnel.fonction} • ${personnel.service || 'Service non précisé'}`}
        meta="Personnel"
        badges={
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            <FaIdCard /> MATRICULE: {personnel.matricule}
          </span>
        }
      >
        <div className="flex flex-col gap-6 p-6 lg:flex-row">
          {/* Photo */}
          <div className="flex justify-center lg:block">
            <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
              {personnel.photo ? (
                <img src={personnel.photo} alt="Photo" className="w-full h-full object-cover" />
              ) : (
                <FaUser size={40} className="text-slate-300" />
              )}
            </div>
          </div>

          {/* Détails */}
          <div className="flex-1 space-y-6">
            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <FaUserTie className="text-indigo-400" /> Informations Personnelles
              </h3>
              <InfoGrid>
                <InfoCard icon={FaUser} label="Genre" value={GenreLabels[personnel.genre]} />
                <InfoCard
                  icon={FaCalendarAlt}
                  label="Date de naissance"
                  value={personnel.dateNaissance ? new Date(personnel.dateNaissance).toLocaleDateString('fr-FR') : '-'}
                />
                <InfoCard icon={FaMapMarkerAlt} label="Adresse" value={personnel.adresse || '-'} />
                <InfoCard icon={FaPhone} label="Téléphone" value={personnel.telephone || '-'} />
                <InfoCard icon={FaEnvelope} label="Email" value={personnel.email || '-'} />
              </InfoGrid>
            </div>

            <div>
              <h3 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <FaBriefcase className="text-indigo-400" /> Informations Professionnelles
              </h3>
              <InfoGrid>
                <InfoCard
                  icon={FaCalendarAlt}
                  label="Date d'embauche"
                  value={personnel.dateEmbauche ? new Date(personnel.dateEmbauche).toLocaleDateString('fr-FR') : '-'}
                />
                <InfoCard
                  icon={FaBriefcase}
                  label="Type de contrat"
                  value={personnel.typeContrat ? TypeContratLabels[personnel.typeContrat] : '-'}
                />
                <InfoCard
                  icon={FaMoneyBillWave}
                  label="Salaire Mensuel"
                  value={personnel.salaire ? `${personnel.salaire.toLocaleString()} $` : '-'}
                />
              </InfoGrid>
            </div>
          </div>
        </div>
      </DetailBanner>
    </PageShell>
  );
}
