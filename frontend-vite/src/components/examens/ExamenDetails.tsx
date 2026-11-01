import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '@/utils/toast';
import {
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
  FaMicroscope,
  FaUserCog,
  FaClipboardList,
  FaPlusCircle,
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useConfirm } from 'react-use-confirming-dialog';
import { examenService } from '@/services/examenService';
import type { Examen } from '@/types/examen';
import { useAuth } from '@/contexts/AuthContext';
import { peutModifier } from '@/utils/permissions';
import { usePermission } from '@/hooks/usePermission';
import SkeletonDetails from '@/ui/SkeletonDetails';
import PageShell from '@/ui/PageShell';
import DetailBanner from '@/ui/DetailBanner';
import { InfoGrid, InfoCard } from '@/ui/InfoCard';
import Button from '@/ui/Button';

const statutColors: Record<string, string> = {
  Prescrit: 'bg-amber-100 text-amber-800',
  Planifié: 'bg-blue-100 text-blue-800',
  En_cours: 'bg-cyan-100 text-cyan-800',
  Réalisé: 'bg-emerald-100 text-emerald-800',
  Validé: 'bg-indigo-100 text-indigo-800',
  Annulé: 'bg-red-100 text-red-800',
};

const confidentialiteColors: Record<string, string> = {
  Normal: 'bg-gray-100 text-gray-700',
  Confidentiel: 'bg-orange-100 text-orange-800',
  Très_confidentiel: 'bg-red-100 text-red-700',
};

const fmt = (d?: string | null) => (d ? format(new Date(d), 'dd/MM/yyyy à HH:mm', { locale: fr }) : null);

export default function ExamenDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { user, hasPermission } = useAuth();
  const { allowed: peutVoir } = usePermission('EXAMENS_VOIR');
  const [examen, setExamen] = useState<Examen | null>(null);
  const [loading, setLoading] = useState(true);

  // Sans la permission EXAMENS_VOIR : on renvoie vers le tableau de bord
  // (l'API renverrait 403, la page afficherait « Examen non trouvé » sinon).
  useEffect(() => {
    if (!peutVoir) {
      toast.error("Vous n'avez pas les droits pour accéder à cette section");
      navigate('/dashboard', { replace: true });
    }
  }, [peutVoir, navigate]);

  useEffect(() => {
    if (!peutVoir) return;
    examenService
      .getById(Number(id))
      .then(setExamen)
      .catch(() => console.error('Chargement echoue'))
      .finally(() => setLoading(false));
  }, [id, peutVoir]);

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Confirmation',
      message: `Supprimer l'examen ${examen?.numeroExamen} ?`,
    });
    if (!ok) return;
    try {
      await examenService.delete(Number(id));
      toast.success('Examen supprimé');
      navigate('/examens/liste');
    } catch {
      toast.error('Erreur');
    }
  };

  if (!peutVoir) return null; // redirection en cours vers /dashboard
  if (loading) return <SkeletonDetails />;
  if (!examen) return <div className="p-6 text-center">Examen non trouvé</div>;

  // Un médecin ne peut modifier/saisir/supprimer que ses propres examens.
  const proprietaire = peutModifier(user?.role, user?.medecinId, examen.idMedecinPrescripteur);
  const peutGerer = hasPermission('EXAMENS_GERER');
  const peutResultat = hasPermission('EXAMENS_GERER') || hasPermission('EXAMENS_RESULTAT');
  const editable = peutGerer && proprietaire;          // modifier la demande / supprimer
  const saisirResultat = peutResultat && proprietaire; // saisir / modifier le résultat
  const aResultat = !!(examen.resultat || examen.interpretation || examen.compteRendu || examen.conclusion || examen.anomalies);

  const infos: { icon: IconType; label: string; value: string }[] = [
    { icon: FaUser, label: 'Patient', value: examen.patientNom || '—' },
    { icon: FaUserMd, label: 'Médecin prescripteur', value: examen.medecinNom || '—' },
    { icon: FaFileAlt, label: "Type d'examen", value: examen.typeExamen || '—' },
    { icon: FaFlask, label: 'Catégorie', value: examen.libelleCategorie || '—' },
    { icon: FaCalendarAlt, label: 'Prescrit le', value: fmt(examen.datePrescription) || '—' },
    { icon: FaCalendarAlt, label: 'Planifié le', value: fmt(examen.datePlanification) || '—' },
    { icon: FaCalendarAlt, label: 'Réalisé le', value: fmt(examen.dateRealisation) || '—' },
    { icon: FaMicroscope, label: 'Laboratoire', value: examen.laboratoire || '—' },
    { icon: FaUserCog, label: 'Technicien', value: examen.technicien || '—' },
    { icon: FaClipboardList, label: 'Prescription associée', value: examen.idPrescription ? `#${examen.idPrescription}` : '—' },
  ];

  return (
    <PageShell
      title={`Examen ${examen.numeroExamen}`}
      maxWidth="max-w-6xl"
      onBack={() => navigate('/examens/liste')}
      actions={
        <>
            {editable && ['Prescrit', 'Planifié', 'En_cours'].includes(examen.statut) && (
              <Button variant="secondary" icon={<FaEdit />} onClick={() => navigate(`/examens/modifier/${examen.idExamen}`)}>
                Modifier la demande
              </Button>
            )}
            {saisirResultat && examen.statut !== 'Validé' && (
              <Button icon={<FaFlask />} onClick={() => navigate(`/examens/resultat/${examen.idExamen}`)}>
                {examen.statut === 'Réalisé' ? 'Modifier le résultat' : 'Saisir le résultat'}
              </Button>
            )}
            <Button variant="secondary" icon={<FaPrint />} onClick={() => navigate(`/examens/${examen.idExamen}/impression`)}>
              Imprimer
            </Button>
            {examen.idPrescription && (
              <Button variant="secondary" icon={<FaPrint />} onClick={() => navigate(`/examens/prescriptions/${examen.idPrescription}/impression`)}>
                Imprimer tous les examens
              </Button>
            )}
            {editable && (
              <Button variant="danger" icon={<FaTrash />} onClick={handleDelete}>
                Supprimer
              </Button>
            )}
          </>
        }
      >

      {/* Bannière */}
      <DetailBanner
        meta="Examen médical"
        title={examen.typeExamen}
        subtitle={examen.libelleCategorie}
        badges={
          <>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statutColors[examen.statut] || 'bg-gray-200'}`}>
              {examen.statut}
            </span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${confidentialiteColors[examen.confidentialite] || 'bg-gray-200'}`}>
              {examen.confidentialite.replace('_', ' ')}
            </span>
          </>
        }
      >
        {/* Infos en cartes */}
        <InfoGrid>
          {infos.map((info) => (
            <InfoCard key={info.label} icon={info.icon} label={info.label} value={info.value} />
          ))}
        </InfoGrid>
      </DetailBanner>

      {/* Résultat */}
      {aResultat ? (
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaFlask className="text-indigo-500" /> Résultat de l&apos;examen
          </h3>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {examen.resultat && (
              <ResultCard icon={FaInfoCircle} color="indigo" title="Résultat" text={examen.resultat} />
            )}
            {examen.interpretation && (
              <ResultCard icon={FaInfoCircle} color="blue" title="Interprétation" text={examen.interpretation} />
            )}
            {examen.compteRendu && (
              <ResultCard icon={FaFileAlt} color="violet" title="Compte rendu" text={examen.compteRendu} />
            )}
            {examen.anomalies && (
              <ResultCard icon={FaExclamationTriangle} color="amber" title="Anomalies" text={examen.anomalies} />
            )}
            {examen.conclusion && (
              <ResultCard icon={FaCheckCircle} color="emerald" title="Conclusion" text={examen.conclusion} />
            )}
          </div>

          {examen.fichierJoint && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Fichier joint</p>
              <a href={examen.fichierJoint} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:underline">
                {examen.fichierJoint}
              </a>
            </div>
          )}

          {examen.dateValidation && (
            <p className="flex items-center gap-2 text-sm text-gray-500">
              <FaCheckCircle className="text-emerald-500" />
              Validé le {fmt(examen.dateValidation)}
              {examen.validateurNom ? ` par ${examen.validateurNom}` : ''}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-12 text-center shadow-sm">
          <FaFlask className="text-4xl text-gray-200" />
          <p className="text-sm text-gray-500">Aucun résultat pour cet examen.</p>
          {saisirResultat && examen.statut !== 'Validé' && (
            <Button icon={<FaPlusCircle />} onClick={() => navigate(`/examens/resultat/${examen.idExamen}`)}>
              Saisir le résultat
            </Button>
          )}
        </div>
      )}
    </PageShell>
  );
}

const colorClasses: Record<string, string> = {
  indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  blue: 'bg-blue-50 text-blue-600 border-blue-100',
  violet: 'bg-violet-50 text-violet-600 border-violet-100',
  amber: 'bg-amber-50 text-amber-600 border-amber-100',
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
};

function ResultCard({
  icon: Icon,
  color,
  title,
  text,
}: {
  icon: IconType;
  color: string;
  title: string;
  text: string;
}) {
  return (
    <div className={`rounded-2xl border bg-white p-5 shadow-sm ${colorClasses[color] ?? 'border-slate-100'}`}>
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-gray-800">
        <Icon className="text-current opacity-80" /> {title}
      </h4>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{text}</p>
    </div>
  );
}
