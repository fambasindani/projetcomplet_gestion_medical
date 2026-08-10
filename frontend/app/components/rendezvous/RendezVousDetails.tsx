'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaEdit, FaCalendarAlt, FaUserMd, FaUserInjured,
  FaStethoscope, FaClock, FaTimesCircle
} from 'react-icons/fa';
import type { IconType } from 'react-icons';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { rendezvousService } from '@/app/services/rendezvousService';
import { RendezVous, StatutRendezVous } from '@/app/types/rendezvous';

const statutStyles: Record<StatutRendezVous, string> = {
  [StatutRendezVous.Programme]: 'bg-blue-50 text-blue-700 border-blue-200',
  [StatutRendezVous.Confirme]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [StatutRendezVous.Annule]: 'bg-red-50 text-red-700 border-red-200',
  [StatutRendezVous.Termine]: 'bg-slate-50 text-slate-700 border-slate-200',
  [StatutRendezVous.NonPresente]: 'bg-amber-50 text-amber-700 border-amber-200',
};

export default function RendezVousDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [rdv, setRdv] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      rendezvousService.getById(Number(id))
        .then(setRdv)
        .catch(() => toast.error('Erreur lors du chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (!rdv) return <div className="p-10 text-center text-gray-500">Rendez-vous introuvable.</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails du rendez-vous"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/rendezvous')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/rendezvous/${id}/modifier`)}>
              Modifier
            </Button>
            {rdv.statut !== StatutRendezVous.Annule && (
              <Button variant="danger" onClick={() => router.push(`/rendezvous`)} icon={<FaTimesCircle />}>
                Annuler
              </Button>
            )}
          </>
        }
      />

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">Détails du Rendez-vous</h1>
              <p className="flex items-center gap-2 opacity-90">
                <FaCalendarAlt /> {format(new Date(rdv.dateRdv), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statutStyles[rdv.statut]}`}>
              {rdv.statut}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoBlock icon={FaUserInjured} label="Patient" value={`${rdv.patientNom} ${rdv.patientPrenom}`} />
            <InfoBlock icon={FaUserMd} label="Médecin" value={`Dr. ${rdv.medecinNom} ${rdv.medecinPrenom}`} subValue={rdv.medecinSpecialite} />
            <InfoBlock icon={FaClock} label="Horaire" value={format(new Date(rdv.dateRdv), "HH'h'mm")} subValue={`${rdv.dureeEstimee || 30} minutes`} />
            <InfoBlock icon={FaStethoscope} label="Type" value={rdv.typeConsultation || 'Standard'} />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Informations cliniques</h3>
            <div className="bg-gray-50 p-4 rounded-xl space-y-4">
              <p className="text-gray-700"><strong className="block text-xs uppercase">Motif</strong>{rdv.motif}</p>
              <p className="text-gray-700"><strong className="block text-xs uppercase">Notes</strong>{rdv.notesPreliminaires || 'Aucune note'}</p>
            </div>
          </div>

          {rdv.statut === StatutRendezVous.Annule && rdv.motifAnnulation && (
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <p className="text-red-800 font-semibold text-sm">Motif d&apos;annulation : {rdv.motifAnnulation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sous-composant pour éviter la répétition
interface InfoBlockProps {
  icon: IconType;
  label: string;
  value: string;
  subValue?: string;
}

function InfoBlock({ icon: Icon, label, value, subValue }: InfoBlockProps) {
  return (
    <div className="flex gap-4">
      <div className="text-indigo-500 pt-1"><Icon size={20} /></div>
      <div>
        <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
        <p className="font-semibold text-gray-800">{value}</p>
        {subValue && <p className="text-sm text-gray-500">{subValue}</p>}
      </div>
    </div>
  );
}
