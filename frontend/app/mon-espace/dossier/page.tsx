'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  FaFolderOpen, FaUser, FaTint, FaBirthdayCake, FaPhone, FaEnvelope,
  FaMapMarkerAlt, FaHeartbeat, FaExclamationTriangle, FaIdCard, FaStethoscope,
} from 'react-icons/fa';
import { patientPortalService, type MonDossier } from '@/app/services/patientPortalService';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import PageHeader from '@/app/ui/PageHeader';
import SkeletonDetails from '@/app/ui/SkeletonDetails';

const GENRE: Record<string, string> = { M: 'Masculin', F: 'Féminin' };

export default function MonDossierPage() {
  const [dossier, setDossier] = useState<MonDossier | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setDossier(await patientPortalService.getDossier());
      } catch (e) {
        toast.error(extractErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <SkeletonDetails />;
  if (!dossier) return <p className="p-6 text-center text-slate-400">Dossier indisponible.</p>;

  const i = dossier.informations as Record<string, string | null>;

  return (
    <div className="space-y-5">
      <PageHeader title="Mon dossier médical" subtitle="Vos informations et constantes" />

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <Panel title="Informations personnelles" icon={<FaUser className="text-indigo-500" />}>
          <Field label="Nom" value={i.nom} />
          <Field label="Prénom" value={i.prenom} />
          <Field label="Date de naissance" value={i.dateNaissance ? new Date(i.dateNaissance).toLocaleDateString('fr-FR') : null} />
          <Field label="Genre" value={i.genre ? GENRE[i.genre] ?? i.genre : null} />
          <Field label="N° sécurité sociale" value={i.numeroSecuriteSociale} />
          <Field label="Situation familiale" value={i.situationFamiliale} />
        </Panel>

        <Panel title="Coordonnées" icon={<FaPhone className="text-indigo-500" />}>
          <Field label="Téléphone" value={i.telephone} icon={FaPhone} />
          <Field label="Email" value={i.email} icon={FaEnvelope} />
          <Field label="Adresse" value={i.adresse} icon={FaMapMarkerAlt} />
        </Panel>

        <Panel title="Données médicales" icon={<FaStethoscope className="text-rose-500" />}>
          <Field label="Groupe sanguin" value={i.groupeSanguin} icon={FaTint} />
          <Field label="Allergies" value={i.allergies} icon={FaExclamationTriangle} />
          <Field label="Antécédents médicaux" value={i.antecedentsMedicaux} />
          <Field label="Antécédents chirurgicaux" value={i.antecedentsChirurgicaux} />
          <Field label="Traitement habituel" value={i.traitementHabituel} />
        </Panel>

        <Panel title="Dernières constantes" icon={<FaHeartbeat className="text-emerald-500" />}>
          {dossier.constantes.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">Aucune constante enregistrée.</p>
          ) : (
            <div className="space-y-3 py-2">
              {dossier.constantes.slice(0, 5).map((c, idx) => (
                <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50/60 px-4 py-3">
                  <p className="mb-2 text-xs font-semibold text-slate-500">
                    {new Date(c.dateMesure).toLocaleString('fr-FR')}
                  </p>
                  <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
                    {c.temperature != null && <Const label="Temp." value={`${c.temperature} °C`} />}
                    {c.pouls != null && <Const label="Pouls" value={`${c.pouls} bpm`} />}
                    {(c.pressionSystolique != null || c.pressionDiastolique != null) && (
                      <Const label="Tension" value={`${c.pressionSystolique ?? '-'}/${c.pressionDiastolique ?? '-'}`} />
                    )}
                    {c.saturation != null && <Const label="SpO₂" value={`${c.saturation} %`} />}
                    {c.frequenceRespiratoire != null && <Const label="FR" value={`${c.frequenceRespiratoire}/min`} />}
                    {c.glycemie != null && <Const label="Glycémie" value={`${c.glycemie}`} />}
                  </div>
                  {c.observations && <p className="mt-2 text-xs text-slate-500">{c.observations}</p>}
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
        <h5 className="text-sm font-semibold text-slate-700">{icon} {title}</h5>
      </div>
      <div className="divide-y divide-slate-100 px-5">{children}</div>
    </div>
  );
}

function Field({ label, value, icon: Icon }: { label: string; value?: string | null; icon?: React.ElementType }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <span className="flex items-center gap-2 text-sm text-slate-500">
        {Icon && <Icon className="text-slate-300" size={12} />}
        {label}
      </span>
      <span className="max-w-[60%] text-right text-sm font-medium text-slate-700">{value || '-'}</span>
    </div>
  );
}

function Const({ label, value }: { label: string; value: string }) {
  return (
    <span className="text-slate-600">
      <span className="text-slate-400">{label} : </span>
      <span className="font-medium">{value}</span>
    </span>
  );
}
