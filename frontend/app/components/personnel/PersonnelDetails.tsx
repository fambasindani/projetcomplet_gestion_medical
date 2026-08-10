'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaEdit, FaEnvelope, FaPhone, FaMapMarkerAlt,
  FaBriefcase, FaCalendarAlt, FaIdCard, FaUser, FaUserTie
} from 'react-icons/fa';
import { personnelService } from '@/app/services/personnelService';
import type { PersonnelResponse } from '@/app/types/personnel';
import { GenreLabels, TypeContratLabels } from '@/app/types/personnel';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

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
    <div className="space-y-6">
      <PageHeader
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
      />

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {/* Header Profile */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden border-2 border-white/20">
            {personnel.photo ? <img src={personnel.photo} alt="Photo" className="w-full h-full object-cover" /> : <FaUser size={40} className="opacity-50" />}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{personnel.nom} {personnel.prenom}</h1>
            <p className="opacity-80 font-medium">{personnel.fonction} • {personnel.service || 'Service non précisé'}</p>
            <div className="mt-2 inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-bold">
              <FaIdCard /> MATRICULE: {personnel.matricule}
            </div>
          </div>
        </div>

        {/* Détails */}
        <div className="p-8 grid md:grid-cols-2 gap-8">
          <Section title="Informations Personnelles" icon={FaUserTie}>
            <DataRow label="Genre" value={GenreLabels[personnel.genre]} />
            <DataRow label="Date de naissance" value={personnel.dateNaissance ? new Date(personnel.dateNaissance).toLocaleDateString('fr-FR') : '-'} />
            <DataRow label="Adresse" value={personnel.adresse || '-'} icon={FaMapMarkerAlt} />
            <DataRow label="Téléphone" value={personnel.telephone || '-'} icon={FaPhone} />
            <DataRow label="Email" value={personnel.email || '-'} icon={FaEnvelope} />
          </Section>

          <Section title="Informations Professionnelles" icon={FaBriefcase}>
            <DataRow label="Date d'embauche" value={personnel.dateEmbauche ? new Date(personnel.dateEmbauche).toLocaleDateString('fr-FR') : '-'} icon={FaCalendarAlt} />
            <DataRow label="Type de contrat" value={personnel.typeContrat ? TypeContratLabels[personnel.typeContrat] : '-'} />
            <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <p className="text-[10px] uppercase font-bold text-indigo-400">Salaire Mensuel</p>
              <p className="text-xl font-bold text-indigo-900">{personnel.salaire ? `${personnel.salaire.toLocaleString()} $` : '-'}</p>
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
        <Icon className="text-indigo-400" /> {title}
      </h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function DataRow({ label, value, icon: Icon }: { label: string; value: React.ReactNode; icon?: React.ElementType }) {
  return (
    <div className="flex items-start gap-3">
      {Icon && <Icon className="text-gray-300 mt-1" />}
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
        <p className="text-sm font-semibold text-gray-700">{value}</p>
      </div>
    </div>
  );
}
