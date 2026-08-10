'use client';

import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FaTimes, FaUserInjured, FaStethoscope, FaHospital } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { urgenceService } from '@/app/services/urgenceService';
import type { AdmissionUrgence, StatutAdmissionUrgence } from '@/app/types/urgence';
import { GraviteUrgenceLabels, StatutAdmissionUrgenceLabels } from '@/app/types/urgence';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

interface AdmissionDetailsModalProps {
  admission: AdmissionUrgence;
  onClose: () => void;
  onRefresh: () => void;
}

const statutColors: Record<StatutAdmissionUrgence, string> = {
  En_attente: 'bg-yellow-100 text-yellow-800',
  En_consultation: 'bg-blue-100 text-blue-800',
  En_observation: 'bg-purple-100 text-purple-800',
  Hospitalise: 'bg-indigo-100 text-indigo-800',
  Sorti: 'bg-green-100 text-green-800',
  Transfere: 'bg-gray-100 text-gray-700',
};

export default function AdmissionDetailsModal({ admission, onClose, onRefresh }: AdmissionDetailsModalProps) {
  const [loading, setLoading] = useState(false);
  const [current, setCurrent] = useState<AdmissionUrgence>(admission);
  const [interventions, setInterventions] = useState<{ idInterventionUrgence: number; typeIntervention: string; dateIntervention: string; statut: string }[]>([]);

  const [prevAdmission, setPrevAdmission] = useState(admission);
  if (prevAdmission !== admission) {
    setPrevAdmission(admission);
    setCurrent(admission);
  }

  useEffect(() => {
    void (async () => {
      try {
        const list = await urgenceService.getInterventionsByAdmission(admission.idAdmissionUrgence);
        setInterventions(list);
      } catch {
        setInterventions([]);
      }
    })();
  }, [admission]);

  const changerStatut = async (statut: StatutAdmissionUrgence) => {
    setLoading(true);
    try {
      const updated = await urgenceService.changerStatutAdmission(current.idAdmissionUrgence, statut);
      setCurrent(updated);
      toast.success('Statut mis à jour');
      onRefresh();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const patient = `${current.patientPrenom ?? ''} ${current.patientNom ?? ''}`.trim() || `Patient #${current.idPatient}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-red-600 text-white">
              <FaUserInjured className="text-xl" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{patient}</h2>
              <p className="font-mono text-xs text-gray-500">{current.numeroAdmission}</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${statutColors[current.statut]}`}>
            {StatutAdmissionUrgenceLabels[current.statut]}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            {GraviteUrgenceLabels[current.gravite]}
          </span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            Arrivée : {format(new Date(current.dateArrivee), 'dd/MM/yyyy HH:mm', { locale: fr })}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><FaStethoscope className="text-rose-500" /> Informations cliniques</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Motif</dt><dd className="text-right font-medium">{current.motifUrgent}</dd></div>
              {current.symptomes && <div className="flex justify-between gap-4"><dt className="text-gray-500">Symptômes</dt><dd className="text-right font-medium">{current.symptomes}</dd></div>}
              {current.tensionArterielle && <div className="flex justify-between gap-4"><dt className="text-gray-500">Tension</dt><dd className="text-right font-medium">{current.tensionArterielle}</dd></div>}
              {current.pouls != null && <div className="flex justify-between gap-4"><dt className="text-gray-500">Pouls</dt><dd className="text-right font-medium">{current.pouls} bpm</dd></div>}
              {current.temperature != null && <div className="flex justify-between gap-4"><dt className="text-gray-500">Température</dt><dd className="text-right font-medium">{current.temperature} °C</dd></div>}
              {current.saturationOxygene != null && <div className="flex justify-between gap-4"><dt className="text-gray-500">Saturation O₂</dt><dd className="text-right font-medium">{current.saturationOxygene} %</dd></div>}
              {current.orientation && <div className="flex justify-between gap-4"><dt className="text-gray-500">Orientation</dt><dd className="text-right font-medium">{current.orientation}</dd></div>}
            </dl>
          </div>
          <div className="rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700"><FaHospital className="text-indigo-500" /> Prise en charge</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Médecin</dt><dd className="text-right font-medium">{current.medecinPrenom && current.medecinNom ? `${current.medecinPrenom} ${current.medecinNom}` : '—'}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-gray-500">Prise en charge</dt><dd className="text-right font-medium">{current.datePriseEnCharge ? format(new Date(current.datePriseEnCharge), 'dd/MM/yyyy HH:mm', { locale: fr }) : '—'}</dd></div>
              {current.notes && <div className="flex justify-between gap-4"><dt className="text-gray-500">Notes</dt><dd className="text-right font-medium">{current.notes}</dd></div>}
            </dl>
          </div>
        </div>

        {interventions.length > 0 && (
          <div className="mt-4 rounded-xl bg-gray-50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-700">Interventions d&apos;urgence</h3>
            <ul className="space-y-2 text-sm">
              {interventions.map((i) => (
                <li key={i.idInterventionUrgence} className="flex items-center justify-between rounded-lg bg-white p-3">
                  <div>
                    <p className="font-medium">{i.typeIntervention}</p>
                    <p className="text-xs text-gray-500">{format(new Date(i.dateIntervention), 'dd/MM/yyyy HH:mm', { locale: fr })}</p>
                  </div>
                  <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">{i.statut}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-5 border-t border-gray-100 pt-4">
          <p className="mb-2 text-sm font-semibold text-gray-700">Changer le statut :</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(StatutAdmissionUrgenceLabels) as StatutAdmissionUrgence[])
              .filter((s) => s !== current.statut)
              .map((s) => (
                <button key={s} onClick={() => changerStatut(s)} disabled={loading}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-50">
                  {StatutAdmissionUrgenceLabels[s]}
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
