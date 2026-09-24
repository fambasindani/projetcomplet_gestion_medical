'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FaUser, FaUserMd, FaCalendarAlt, FaProcedures, FaMapMarkerAlt,
  FaClock, FaClipboardList, FaCheckCircle, FaExclamationTriangle,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { urgenceService } from '@/app/services/urgenceService';
import type { InterventionUrgence } from '@/app/types/urgence';
import { StatutInterventionUrgenceLabels } from '@/app/types/urgence';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';

const statutColors: Record<string, string> = {
  Planifiee: 'bg-blue-100 text-blue-800',
  En_cours: 'bg-cyan-100 text-cyan-800',
  Terminee: 'bg-emerald-100 text-emerald-800',
  Annulee: 'bg-red-100 text-red-800',
};

const fmt = (d?: string | null) => (d ? format(new Date(d), 'dd/MM/yyyy à HH:mm', { locale: fr }) : '—');

export default function InterventionUrgenceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [intervention, setIntervention] = useState<InterventionUrgence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    urgenceService.getInterventionById(Number(id))
      .then(setIntervention)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (error || !intervention) {
    return (
      <PageShell title="Intervention d'urgence" onBack={() => router.back()}>
        <div className="rounded-xl bg-red-50 p-4 text-red-700">{error || 'Intervention introuvable'}</div>
      </PageShell>
    );
  }

  const i = intervention;

  return (
    <PageShell
      title={`Intervention ${i.numeroIntervention}`}
      subtitle={i.typeIntervention}
      onBack={() => router.back()}
    >
      <DetailBanner
        meta="Urgences"
        title={i.typeIntervention}
        subtitle={`Patient : ${i.patientPrenom ?? ''} ${i.patientNom ?? ''}`}
        badges={
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statutColors[i.statut] ?? 'bg-slate-200'}`}>
            {StatutInterventionUrgenceLabels[i.statut] ?? i.statut}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaUser} label="Patient" value={`${i.patientPrenom ?? ''} ${i.patientNom ?? ''}`} />
          <InfoCard icon={FaUserMd} label="Médecin principal" value={i.medecinNom ? `Dr. ${i.medecinNom} ${i.medecinPrenom ?? ''}` : '—'} />
          <InfoCard icon={FaCalendarAlt} label="Date" value={fmt(i.dateIntervention)} />
          <InfoCard icon={FaMapMarkerAlt} label="Lieu" value={i.lieu || '—'} />
          <InfoCard icon={FaClock} label="Durée prévue" value={i.dureePrevue != null ? `${i.dureePrevue} min` : '—'} />
          <InfoCard icon={FaClipboardList} label="Admission liée" value={i.idAdmissionUrgence ? `#${i.idAdmissionUrgence}` : '—'} />
          {i.libelleActeCatalogue && (
            <InfoCard icon={FaProcedures} label="Acte du catalogue" value={i.libelleActeCatalogue} />
          )}
        </InfoGrid>
      </DetailBanner>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TextCard icon={FaClipboardList} title="Actes réalisés" text={i.actesRealises} />
        <TextCard icon={FaClipboardList} title="Matériel utilisé" text={i.materielUtilise} />
        <TextCard icon={FaExclamationTriangle} title="Complications" text={i.complications} tone="amber" />
        <TextCard icon={FaCheckCircle} title="Résultat" text={i.resultat} tone="emerald" />
        <TextCard icon={FaClipboardList} title="Notes" text={i.notes} />
      </div>
    </PageShell>
  );
}

function TextCard({
  icon: Icon,
  title,
  text,
  tone = 'indigo',
}: {
  icon: IconType;
  title: string;
  text?: string | null;
  tone?: 'indigo' | 'amber' | 'emerald';
}) {
  const tones: Record<string, string> = {
    indigo: 'border-indigo-100',
    amber: 'border-amber-100',
    emerald: 'border-emerald-100',
  };
  const iconTones: Record<string, string> = {
    indigo: 'text-indigo-500',
    amber: 'text-amber-500',
    emerald: 'text-emerald-500',
  };
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${tones[tone]}`}>
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
        <Icon className={iconTones[tone]} /> {title}
      </h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text || 'Non renseigné.'}</p>
    </div>
  );
}
