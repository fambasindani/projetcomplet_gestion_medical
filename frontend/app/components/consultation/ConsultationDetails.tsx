// app/consultations/[id]/details/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaUserMd,
  FaUserInjured,
  FaHeartbeat,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoGrid, InfoCard } from '@/app/ui/InfoCard';
import Button from '@/app/ui/Button';
import { consultationService } from '@/app/services/consultationService';
import { Consultation } from '@/app/types/consultation';
import { useAuth } from '@/app/contexts/AuthContext';
import { peutModifier } from '@/app/utils/permissions';

export default function ConsultationDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const { user } = useAuth();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      consultationService
        .getById(Number(id))
        .then(setConsultation)
        .catch(() => toast.error('Erreur de chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Supprimer la consultation',
      message: `Supprimer la consultation du ${format(
        new Date(consultation!.dateConsultation),
        'dd/MM/yyyy HH:mm'
      )} ?`,
    });
    if (!ok) return;
    try {
      await consultationService.delete(Number(id));
      toast.success('Consultation supprimée');
      router.push('/consultations');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!consultation) return <div className="p-6 text-center">Consultation non trouvée</div>;

  // Un médecin ne peut modifier/supprimer que ses propres consultations.
  const editable = peutModifier(user?.role, user?.medecinId, consultation.idMedecin);

  return (
    <PageShell
      title="Détails de la consultation"
      maxWidth="max-w-6xl"
      onBack={() => router.push('/consultations')}
      actions={
        editable ? (
          <>
            <Button icon={<FaEdit />} onClick={() => router.push(`/consultations/${consultation.idConsultation}/modifier`)}>
              Modifier
            </Button>
            <Button variant="danger" icon={<FaTrash />} onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Consultation d&apos;un autre médecin — lecture seule
          </span>
        )
      }
    >
      <DetailBanner
        meta="Consultation"
        title={`Consultation du ${format(new Date(consultation.dateConsultation), 'dd MMMM yyyy', { locale: fr })}`}
        subtitle={format(new Date(consultation.dateConsultation), "HH'h'mm", { locale: fr })}
      >
        <InfoGrid>
          <InfoCard
            icon={FaUserInjured}
            label="Patient"
            value={`${consultation.patientNom} ${consultation.patientPrenom}`}
          />
          <InfoCard
            icon={FaUserMd}
            label="Médecin"
            value={`Dr. ${consultation.medecinNom} ${consultation.medecinPrenom}`}
          />
        </InfoGrid>

        <div className="space-y-6 px-6 pb-6">
          {/* Motif, diagnostic, histoire, traitement, observations */}
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Motif de la consultation</p>
              <p className="mt-1 font-medium text-gray-700">{consultation.motifConsultation}</p>
            </div>
            {consultation.diagnostic && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Diagnostic</p>
                <p className="mt-1 text-gray-700">{consultation.diagnostic}</p>
              </div>
            )}
            {consultation.histoireMaladie && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Histoire de la maladie</p>
                <p className="mt-1 text-gray-700">{consultation.histoireMaladie}</p>
              </div>
            )}
            {consultation.traitementPrescris && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Traitement prescrit</p>
                <p className="mt-1 text-gray-700">{consultation.traitementPrescris}</p>
              </div>
            )}
            {consultation.observations && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Observations</p>
                <p className="mt-1 text-gray-700">{consultation.observations}</p>
              </div>
            )}
          </div>

          {/* Constantes vitales */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-400">
              <FaHeartbeat className="text-red-500" /> Constantes
            </h3>
            <InfoGrid className="p-0">
              {consultation.temperature && (
                <InfoCard icon={FaHeartbeat} label="Température" value={`${consultation.temperature} °C`} />
              )}
              {consultation.pouls && (
                <InfoCard icon={FaHeartbeat} label="Pouls" value={`${consultation.pouls} bpm`} />
              )}
              {consultation.pressionSystolique && consultation.pressionDiastolique && (
                <InfoCard
                  icon={FaHeartbeat}
                  label="Tension artérielle"
                  value={`${consultation.pressionSystolique}/${consultation.pressionDiastolique} mmHg`}
                />
              )}
              {consultation.saturation && (
                <InfoCard icon={FaHeartbeat} label="Saturation O₂" value={`${consultation.saturation} %`} />
              )}
              {consultation.glycemie && (
                <InfoCard icon={FaHeartbeat} label="Glycémie" value={`${consultation.glycemie} g/L`} />
              )}
              {consultation.poids && (
                <InfoCard icon={FaHeartbeat} label="Poids" value={`${consultation.poids} kg`} />
              )}
              {consultation.taille && (
                <InfoCard icon={FaHeartbeat} label="Taille" value={`${consultation.taille} m`} />
              )}
              {consultation.imc && (
                <InfoCard icon={FaHeartbeat} label="IMC" value={consultation.imc} />
              )}
            </InfoGrid>
          </div>

          {/* Arrêt de travail, certificat, évolution, prochain RDV, notes */}
          <div className="space-y-4">
            {consultation.arretTravailDebut && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Arrêt de travail</p>
                <p className="mt-1 text-gray-700">
                  du {format(new Date(consultation.arretTravailDebut), 'dd/MM/yyyy')}
                  {consultation.arretTravailFin &&
                    ` au ${format(new Date(consultation.arretTravailFin), 'dd/MM/yyyy')}`}
                </p>
              </div>
            )}
            {consultation.certificatMedical && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Certificat médical</p>
                <p className="mt-1 text-gray-700">{consultation.certificatMedical}</p>
              </div>
            )}
            {consultation.evolution && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Évolution</p>
                <p className="mt-1 text-gray-700">{consultation.evolution}</p>
              </div>
            )}
            {consultation.prochainRdv && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Prochain rendez-vous</p>
                <p className="mt-1 text-gray-700">{format(new Date(consultation.prochainRdv), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            )}
            {consultation.notesConfidentielles && (
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Notes confidentielles</p>
                <p className="mt-1 italic text-gray-700">{consultation.notesConfidentielles}</p>
              </div>
            )}
          </div>
        </div>
      </DetailBanner>
    </PageShell>
  );
}
