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
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoGrid, InfoCard } from '@/app/ui/InfoCard';
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

const statutOptions: StatutRendezVous[] = [
  StatutRendezVous.Programme,
  StatutRendezVous.Confirme,
  StatutRendezVous.Termine,
  StatutRendezVous.NonPresente,
  StatutRendezVous.Annule,
];

export default function RendezVousDetails() {
  const { id } = useParams();
  const router = useRouter();
  const [rdv, setRdv] = useState<RendezVous | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatut, setNewStatut] = useState<StatutRendezVous | ''>('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      rendezvousService.getById(Number(id))
        .then((data) => { setRdv(data); setNewStatut(data.statut); })
        .catch(() => toast.error('Erreur lors du chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleChangerStatut = async () => {
    if (!rdv || !newStatut || newStatut === rdv.statut) return;
    setSaving(true);
    try {
      await rendezvousService.changerStatut(rdv.idRdv, newStatut);
      setRdv({ ...rdv, statut: newStatut });
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur lors du changement de statut');
    } finally {
      setSaving(false);
    }
  };

  const handleAnnuler = async () => {
    if (!rdv) return;
    const motif = window.prompt('Motif d\'annulation :');
    if (motif === null) return;
    setSaving(true);
    try {
      await rendezvousService.annuler(rdv.idRdv, motif || 'Annulation sans motif');
      setRdv({ ...rdv, statut: StatutRendezVous.Annule, motifAnnulation: motif, dateAnnulation: new Date().toISOString() });
      setNewStatut(StatutRendezVous.Annule);
      toast.success('Rendez-vous annulé');
    } catch {
      toast.error('Erreur lors de l\'annulation');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!rdv) return <div className="p-10 text-center text-gray-500">Rendez-vous introuvable.</div>;

  return (
    <PageShell
      title="Détails du rendez-vous"
      maxWidth="max-w-6xl"
      onBack={() => router.push('/rendezvous')}
      actions={
        <>
            <Button icon={<FaEdit />} onClick={() => router.push(`/rendezvous/${id}/modifier`)}>
              Modifier
            </Button>
            {rdv.statut !== StatutRendezVous.Annule && (
              <Button variant="danger" icon={<FaTimesCircle />} onClick={handleAnnuler} disabled={saving}>
                Annuler
              </Button>
            )}
        </>
      }
    >

      <DetailBanner
        meta="Rendez-vous"
        title="Détails du Rendez-vous"
        subtitle={format(new Date(rdv.dateRdv), "EEEE d MMMM yyyy", { locale: fr })}
        badges={
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statutStyles[rdv.statut]}`}>
            {rdv.statut}
          </span>
        }
      >
        <div className="p-8 space-y-8">
          <InfoGrid className="p-0">
            <InfoCard icon={FaUserInjured} label="Patient" value={`${rdv.patientNom} ${rdv.patientPrenom}`} />
            <InfoCard
              icon={FaUserMd}
              label="Médecin"
              value={
                <>
                  {`Dr. ${rdv.medecinNom} ${rdv.medecinPrenom}`}
                  {rdv.medecinSpecialite && <span className="block text-sm font-normal text-slate-500">{rdv.medecinSpecialite}</span>}
                </>
              }
            />
            <InfoCard
              icon={FaClock}
              label="Horaire"
              value={
                <>
                  {format(new Date(rdv.dateRdv), "HH'h'mm")}
                  <span className="block text-sm font-normal text-slate-500">{rdv.dureeEstimee || 30} minutes</span>
                </>
              }
            />
            <InfoCard icon={FaStethoscope} label="Type" value={rdv.typeConsultation || 'Standard'} />
          </InfoGrid>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold text-indigo-700 uppercase tracking-wider">Changer le statut</h3>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={newStatut}
                onChange={(e) => setNewStatut(e.target.value as StatutRendezVous)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              >
                {statutOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <Button onClick={handleChangerStatut} disabled={saving || newStatut === rdv.statut}>
                {saving ? 'Mise à jour...' : 'Appliquer'}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Informations cliniques</h3>
            <div className="bg-slate-50 p-4 rounded-xl space-y-4">
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
      </DetailBanner>
    </PageShell>
  );
}
