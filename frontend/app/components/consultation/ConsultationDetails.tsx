// app/consultations/[id]/details/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft,
  FaUserMd,
  FaUserInjured,
  FaHeartbeat,
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { consultationService } from '@/app/services/consultationService';
import { Consultation } from '@/app/types/consultation';

export default function ConsultationDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails de la consultation"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/consultations')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/consultations/${consultation.idConsultation}/modifier`)}>
              Modifier
            </Button>
            <Button variant="danger" icon={<FaTrash />} onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      />

      {/* Carte principale (pleine largeur) */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">
            Consultation du {format(new Date(consultation.dateConsultation), 'dd MMMM yyyy', { locale: fr })}
          </h1>
          <p className="text-indigo-100 text-sm">
            {format(new Date(consultation.dateConsultation), "HH'h'mm", { locale: fr })}
          </p>
        </div>

        {/* Corps */}
        <div className="p-6 space-y-6">
          {/* Patient et médecin */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <FaUserInjured className="text-blue-500 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Patient</p>
                <p className="font-semibold">
                  {consultation.patientNom} {consultation.patientPrenom}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FaUserMd className="text-green-500 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Médecin</p>
                <p className="font-semibold">
                  Dr. {consultation.medecinNom} {consultation.medecinPrenom}
                </p>
              </div>
            </div>
          </div>

          {/* Motif, diagnostic, histoire, traitement, observations */}
          <div className="border-t pt-4 space-y-4">
            <div>
              <p className="text-sm text-gray-500">Motif de la consultation</p>
              <p className="font-medium">{consultation.motifConsultation}</p>
            </div>
            {consultation.diagnostic && (
              <div>
                <p className="text-sm text-gray-500">Diagnostic</p>
                <p>{consultation.diagnostic}</p>
              </div>
            )}
            {consultation.histoireMaladie && (
              <div>
                <p className="text-sm text-gray-500">Histoire de la maladie</p>
                <p>{consultation.histoireMaladie}</p>
              </div>
            )}
            {consultation.traitementPrescris && (
              <div>
                <p className="text-sm text-gray-500">Traitement prescrit</p>
                <p>{consultation.traitementPrescris}</p>
              </div>
            )}
            {consultation.observations && (
              <div>
                <p className="text-sm text-gray-500">Observations</p>
                <p>{consultation.observations}</p>
              </div>
            )}
          </div>

          {/* Constantes vitales */}
          <div className="border-t pt-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-3">
              <FaHeartbeat className="text-red-500" /> Constantes
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {consultation.temperature && (
                <div>
                  <p className="text-sm text-gray-500">Température</p>
                  <p>{consultation.temperature} °C</p>
                </div>
              )}
              {consultation.pouls && (
                <div>
                  <p className="text-sm text-gray-500">Pouls</p>
                  <p>{consultation.pouls} bpm</p>
                </div>
              )}
              {consultation.pressionSystolique && consultation.pressionDiastolique && (
                <div>
                  <p className="text-sm text-gray-500">Tension artérielle</p>
                  <p>
                    {consultation.pressionSystolique}/{consultation.pressionDiastolique} mmHg
                  </p>
                </div>
              )}
              {consultation.saturation && (
                <div>
                  <p className="text-sm text-gray-500">Saturation O₂</p>
                  <p>{consultation.saturation} %</p>
                </div>
              )}
              {consultation.glycemie && (
                <div>
                  <p className="text-sm text-gray-500">Glycémie</p>
                  <p>{consultation.glycemie} g/L</p>
                </div>
              )}
              {consultation.poids && (
                <div>
                  <p className="text-sm text-gray-500">Poids</p>
                  <p>{consultation.poids} kg</p>
                </div>
              )}
              {consultation.taille && (
                <div>
                  <p className="text-sm text-gray-500">Taille</p>
                  <p>{consultation.taille} m</p>
                </div>
              )}
              {consultation.imc && (
                <div>
                  <p className="text-sm text-gray-500">IMC</p>
                  <p>{consultation.imc}</p>
                </div>
              )}
            </div>
          </div>

          {/* Arrêt de travail, certificat, évolution, prochain RDV, notes */}
          <div className="border-t pt-4 space-y-4">
            {consultation.arretTravailDebut && (
              <div>
                <p className="text-sm text-gray-500">Arrêt de travail</p>
                <p>
                  du {format(new Date(consultation.arretTravailDebut), 'dd/MM/yyyy')}
                  {consultation.arretTravailFin &&
                    ` au ${format(new Date(consultation.arretTravailFin), 'dd/MM/yyyy')}`}
                </p>
              </div>
            )}
            {consultation.certificatMedical && (
              <div>
                <p className="text-sm text-gray-500">Certificat médical</p>
                <p>{consultation.certificatMedical}</p>
              </div>
            )}
            {consultation.evolution && (
              <div>
                <p className="text-sm text-gray-500">Évolution</p>
                <p>{consultation.evolution}</p>
              </div>
            )}
            {consultation.prochainRdv && (
              <div>
                <p className="text-sm text-gray-500">Prochain rendez-vous</p>
                <p>{format(new Date(consultation.prochainRdv), 'dd/MM/yyyy HH:mm')}</p>
              </div>
            )}
            {consultation.notesConfidentielles && (
              <div>
                <p className="text-sm text-gray-500">Notes confidentielles</p>
                <p className="italic">{consultation.notesConfidentielles}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
