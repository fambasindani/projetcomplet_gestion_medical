'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FaUser, FaUserMd, FaCalendarAlt, FaHeartbeat, FaThermometerHalf,
  FaLungs, FaNotesMedical, FaAmbulance,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { urgenceService } from '@/app/services/urgenceService';
import type { AdmissionUrgence } from '@/app/types/urgence';
import { GraviteUrgenceLabels, StatutAdmissionUrgenceLabels } from '@/app/types/urgence';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';

const graviteColors: Record<string, string> = {
  Critique: 'bg-red-100 text-red-800',
  Urgente: 'bg-orange-100 text-orange-800',
  Semi_urgente: 'bg-amber-100 text-amber-800',
  Non_urgente: 'bg-slate-100 text-slate-700',
};

const fmt = (d?: string | null) => (d ? format(new Date(d), 'dd/MM/yyyy à HH:mm', { locale: fr }) : '—');

export default function AdmissionUrgenceDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [admission, setAdmission] = useState<AdmissionUrgence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    urgenceService.getAdmissionById(Number(id))
      .then(setAdmission)
      .catch((e) => setError(extractErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (error || !admission) {
    return (
      <PageShell title="Admission aux urgences" onBack={() => router.back()}>
        <div className="rounded-xl bg-red-50 p-4 text-red-700">{error || 'Admission introuvable'}</div>
      </PageShell>
    );
  }

  const a = admission;

  return (
    <PageShell
      title={`Admission ${a.numeroAdmission}`}
      subtitle="Urgences"
      onBack={() => router.back()}
    >
      <DetailBanner
        meta="Urgences"
        title={a.motifUrgent}
        subtitle={`Patient : ${a.patientPrenom ?? ''} ${a.patientNom ?? ''}`}
        badges={
          <>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${graviteColors[a.gravite] ?? 'bg-slate-200'}`}>
              {GraviteUrgenceLabels[a.gravite] ?? a.gravite}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              {StatutAdmissionUrgenceLabels[a.statut] ?? a.statut}
            </span>
          </>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaUser} label="Patient" value={`${a.patientPrenom ?? ''} ${a.patientNom ?? ''}`} />
          <InfoCard icon={FaUserMd} label="Médecin" value={a.medecinNom ? `Dr. ${a.medecinNom} ${a.medecinPrenom ?? ''}` : 'Non assigné'} />
          <InfoCard icon={FaCalendarAlt} label="Arrivée" value={fmt(a.dateArrivee)} />
          <InfoCard icon={FaCalendarAlt} label="Prise en charge" value={fmt(a.datePriseEnCharge)} />
          <InfoCard icon={FaHeartbeat} label="Tension artérielle" value={a.tensionArterielle || '—'} />
          <InfoCard icon={FaHeartbeat} label="Pouls" value={a.pouls != null ? `${a.pouls} bpm` : '—'} />
          <InfoCard icon={FaThermometerHalf} label="Température" value={a.temperature != null ? `${a.temperature} °C` : '—'} />
          <InfoCard icon={FaLungs} label="Saturation O₂" value={a.saturationOxygene != null ? `${a.saturationOxygene} %` : '—'} />
          <InfoCard icon={FaAmbulance} label="Orientation" value={a.orientation || '—'} />
        </InfoGrid>
      </DetailBanner>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <TextCard icon={FaNotesMedical} title="Symptômes" text={a.symptomes} />
        <TextCard icon={FaNotesMedical} title="Notes" text={a.notes} />
      </div>
    </PageShell>
  );
}

function TextCard({ icon: Icon, title, text }: { icon: IconType; title: string; text?: string | null }) {
  return (
    <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-slate-800">
        <Icon className="text-indigo-500" /> {title}
      </h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text || 'Non renseigné.'}</p>
    </div>
  );
}
