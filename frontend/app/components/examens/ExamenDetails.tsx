'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft,
  FaFlask,
  FaUser,
  FaUserMd,
  FaCalendarAlt,
  FaFileAlt,
  FaEdit,
  FaPrint,
  FaTrash,
  FaInfoCircle,
  FaExclamationTriangle,
  FaCheckCircle,
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { examenService } from '@/app/services/examenService';
import { Examen } from '@/app/types/examen';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

const statutColors: Record<string, string> = {
  Prescrit: 'bg-yellow-100 text-yellow-800',
  Planifié: 'bg-blue-100 text-blue-800',
  Réalisé: 'bg-green-100 text-green-800',
  Validé: 'bg-indigo-100 text-indigo-800',
  Annulé: 'bg-red-100 text-red-800',
};

const confidentialiteColors: Record<string, string> = {
  Normal: 'bg-gray-100 text-gray-800',
  Confidentiel: 'bg-orange-100 text-orange-800',
  'Très confidentiel': 'bg-red-100 text-red-800',
};

export default function ExamenDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    examenService
      .getById(Number(id))
      .then(setExamen)
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Confirmation',
      message: `Supprimer l'examen ${examen?.numeroExamen} ?`,
    });
    if (!ok) return;
    try {
      await examenService.delete(Number(id));
      toast.success('Examen supprimé');
      router.push('/examens/liste');
    } catch {
      toast.error('Erreur');
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!examen) return <div className="p-6 text-center">Examen non trouvé</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Examen ${examen.numeroExamen}`}
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/examens/liste')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/examens/modifier/${examen.idExamen}`)}>
              Modifier
            </Button>
            <Button
              icon={<FaPrint />}
              onClick={() => router.push(`/examens/${examen.idExamen}/impression`)}
            >
              Imprimer
            </Button>
            {examen.idPrescription && (
              <Button
                variant="secondary"
                icon={<FaPrint />}
                onClick={() =>
                  router.push(`/examens/prescriptions/${examen.idPrescription}/impression`)
                }
              >
                Imprimer tous les examens
              </Button>
            )}
            <Button variant="danger" icon={<FaTrash />} onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      />

      {/* Carte principale */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Bannière */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex justify-between items-start">
          <div>
            <h2 className="text-white text-xl font-semibold">{examen.typeExamen}</h2>
            <p className="text-indigo-100 text-sm">{examen.libelleCategorie}</p>
          </div>
          <div className="flex gap-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${statutColors[examen.statut] || 'bg-gray-200'}`}
            >
              {examen.statut}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${confidentialiteColors[examen.confidentialite] || 'bg-gray-200'}`}
            >
              {examen.confidentialite}
            </span>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          {/* Informations générales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-500" />
              <span>
                <strong>Patient :</strong> {examen.patientNom}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaUserMd className="text-gray-500" />
              <span>
                <strong>Médecin prescripteur :</strong> {examen.medecinNom}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaFileAlt className="text-gray-500" />
              <span>
                <strong>Type :</strong> {examen.typeExamen}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaFlask className="text-gray-500" />
              <span>
                <strong>Catégorie :</strong> {examen.libelleCategorie}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaCalendarAlt className="text-gray-500" />
              <span>
                <strong>Prescription :</strong>{' '}
                {format(new Date(examen.datePrescription), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              </span>
            </div>
            {examen.datePlanification && (
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                <span>
                  <strong>Planifié le :</strong>{' '}
                  {format(new Date(examen.datePlanification), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </span>
              </div>
            )}
            {examen.dateRealisation && (
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-500" />
                <span>
                  <strong>Réalisé le :</strong>{' '}
                  {format(new Date(examen.dateRealisation), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <FaUserMd className="text-gray-500" />
              <span>
                <strong>Laboratoire :</strong> {examen.laboratoire || '-'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <FaUserMd className="text-gray-500" />
              <span>
                <strong>Technicien :</strong> {examen.technicien || '-'}
              </span>
            </div>
            {examen.idPrescription && (
              <div className="flex items-center gap-2">
                <FaFileAlt className="text-gray-500" />
                <span>
                  <strong>Prescription associée :</strong> #{examen.idPrescription}
                </span>
              </div>
            )}
          </div>

          {/* Résultat */}
          {examen.resultat && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaInfoCircle className="text-indigo-600" /> Résultat
              </h3>
              <p className="mt-2 whitespace-pre-wrap">{examen.resultat}</p>
            </div>
          )}

          {/* Interprétation */}
          {examen.interpretation && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaInfoCircle className="text-indigo-600" /> Interprétation
              </h3>
              <p className="mt-2 whitespace-pre-wrap">{examen.interpretation}</p>
            </div>
          )}

          {/* Compte rendu */}
          {examen.compteRendu && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaFileAlt className="text-indigo-600" /> Compte rendu
              </h3>
              <p className="mt-2 whitespace-pre-wrap">{examen.compteRendu}</p>
            </div>
          )}

          {/* Anomalies */}
          {examen.anomalies && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaExclamationTriangle className="text-amber-600" /> Anomalies
              </h3>
              <p className="mt-2 whitespace-pre-wrap">{examen.anomalies}</p>
            </div>
          )}

          {/* Conclusion */}
          {examen.conclusion && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FaCheckCircle className="text-green-600" /> Conclusion
              </h3>
              <p className="mt-2 whitespace-pre-wrap">{examen.conclusion}</p>
            </div>
          )}

          {/* Fichier joint */}
          {examen.fichierJoint && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold">Fichier joint</h3>
              <a
                href={examen.fichierJoint}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                {examen.fichierJoint}
              </a>
            </div>
          )}

          {/* Date de validation */}
          {examen.dateValidation && (
            <div className="border-t pt-4 text-sm text-gray-500">
              <FaCalendarAlt className="inline mr-1" />
              Validé le {format(new Date(examen.dateValidation), 'dd/MM/yyyy à HH:mm', { locale: fr })}
              {examen.validateurNom && ` par ${examen.validateurNom}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
