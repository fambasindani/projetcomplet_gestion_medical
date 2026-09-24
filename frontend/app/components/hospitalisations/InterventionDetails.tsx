'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FaUser, FaUserMd, FaCalendarAlt, FaSyringe, FaCut, FaClipboardList,
  FaCheckCircle, FaExclamationTriangle, FaDoorOpen, FaClock, FaNotesMedical,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { interventionService } from '@/app/services/interventionService';
import type { InterventionDetails as InterventionDetailsType } from '@/app/types/intervention';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';

const statutColors: Record<string, string> = {
  Programmee: 'bg-blue-100 text-blue-800',
  En_cours: 'bg-cyan-100 text-cyan-800',
  Terminee: 'bg-emerald-100 text-emerald-800',
  Reportee: 'bg-amber-100 text-amber-800',
  Annulee: 'bg-red-100 text-red-800',
};

const fmt = (d?: string | null) =>
  d ? format(new Date(d), 'dd/MM/yyyy à HH:mm', { locale: fr }) : '—';

export default function InterventionDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [intervention, setIntervention] = useState<InterventionDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    interventionService.getById(Number(id))
      .then(setIntervention)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (error || !intervention) {
    return (
      <PageShell title="Intervention" onBack={() => router.back()}>
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
        meta="Bloc opératoire"
        title={i.typeIntervention}
        subtitle={`Patient : ${i.patientPrenom ?? ''} ${i.patientNom ?? ''}`}
        badges={
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statutColors[i.statut] ?? 'bg-slate-200'}`}>
            {i.statut.replace(/_/g, ' ')}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaUser} label="Patient" value={`${i.patientPrenom ?? ''} ${i.patientNom ?? ''}`} />
          <InfoCard icon={FaUserMd} label="Chirurgien principal" value={i.medecinPrincipalNom ? `Dr. ${i.medecinPrincipalNom} ${i.medecinPrincipalPrenom ?? ''}` : '—'} />
          <InfoCard icon={FaCalendarAlt} label="Date" value={fmt(i.dateIntervention)} />
          <InfoCard icon={FaClock} label="Durée prévue / réelle" value={`${i.dureePrevue ?? '—'} / ${i.dureeReelle ?? '—'} min`} />
          <InfoCard icon={FaDoorOpen} label="Salle d'opération" value={i.salleOperation || '—'} />
          <InfoCard icon={FaSyringe} label="Anesthésie" value={i.anesthesieType || '—'} />
          <InfoCard icon={FaUserMd} label="Anesthésiste" value={i.anesthesisteNom || '—'} />
          <InfoCard icon={FaClipboardList} label="Hospitalisation" value={i.numeroAdmission || (i.idHospitalisation ? `#${i.idHospitalisation}` : '—')} />
          <InfoCard icon={FaCheckCircle} label="Consentement signé" value={i.consentementSigne ? 'Oui' : 'Non'} />
          <InfoCard icon={FaCheckCircle} label="Jeûne respecté" value={i.jeunRespecte ? 'Oui' : 'Non'} />
        </InfoGrid>
      </DetailBanner>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TextCard icon={FaClipboardList} title="Description pré-opératoire" text={i.descriptionPreop} />
        <TextCard icon={FaCut} title="Compte rendu opératoire" text={i.compteRenduOperatoire} />
        <TextCard icon={FaExclamationTriangle} title="Complications" text={i.complications} tone="amber" />
        <TextCard icon={FaCheckCircle} title="Résultat" text={i.resultat} tone="emerald" />
        <TextCard icon={FaNotesMedical} title="Suites opératoires" text={i.suitesOperatoires} />
        <TextCard icon={FaNotesMedical} title="Notes infirmières" text={i.notesInfirmieres} />
      </div>

      {i.statut === 'Annulee' && (i.motifAnnulation || i.dateAnnulation) && (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Intervention annulée {i.dateAnnulation ? `le ${fmt(i.dateAnnulation)}` : ''}
          {i.motifAnnulation ? ` — motif : ${i.motifAnnulation}` : ''}
        </div>
      )}
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
    indigo: 'border-indigo-100 text-indigo-600',
    amber: 'border-amber-100 text-amber-600',
    emerald: 'border-emerald-100 text-emerald-600',
  };
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${tones[tone]}`}>
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
        <Icon /> {title}
      </h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text || 'Non renseigné.'}</p>
    </div>
  );
}
