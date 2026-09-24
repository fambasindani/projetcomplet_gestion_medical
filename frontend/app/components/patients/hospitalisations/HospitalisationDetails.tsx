'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaCalendarAlt,
  FaUserMd,
  FaUserInjured,
  FaBed,
  FaClipboardList,
  FaHeartbeat,
  FaEdit,
  FaExchangeAlt
} from 'react-icons/fa';

import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import FormSection from '@/app/ui/FormSection';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
import Button, { IconButton } from '@/app/ui/Button';
import { hospitalisationService } from '@/app/services/hospitalisationService';
import { Hospitalisation, StatutHospitalisation } from '@/app/types/hospitalisation';
import { useAuth } from '@/app/contexts/AuthContext';
import { peutModifier } from '@/app/utils/permissions';

const statutColors: Record<StatutHospitalisation, string> = {
  En_cours: 'bg-blue-100 text-blue-800',
  Terminée: 'bg-green-100 text-green-800',
  Transféré: 'bg-yellow-100 text-yellow-800',
  Décédé: 'bg-red-100 text-red-800',
  Sortie_contre_avis: 'bg-orange-100 text-orange-800'
};

// Liste des statuts pour le modal (on exclut éventuellement le statut actuel)
const allStatuts = Object.values(StatutHospitalisation);

export default function HospitalisationDetails() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [hospitalisation, setHospitalisation] = useState<Hospitalisation | null>(null);
  const [loading, setLoading] = useState(true);
  const [showStatutModal, setShowStatutModal] = useState(false);
  const [selectedStatut, setSelectedStatut] = useState<StatutHospitalisation | null>(null);

  useEffect(() => {
    if (id) {
      hospitalisationService.getById(Number(id))
        .then(setHospitalisation)
        .catch(() => toast.error('Erreur lors du chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);


const handleStatutChange = async () => {
  if (!selectedStatut || !hospitalisation) return;
  try {
    await hospitalisationService.changerStatut(hospitalisation.idHospitalisation, selectedStatut);
    toast.success(`Statut mis à jour : ${selectedStatut}`);
    // Recharger les données
    const updated = await hospitalisationService.getById(hospitalisation.idHospitalisation);
    setHospitalisation(updated);
    setShowStatutModal(false);
  } catch {
    toast.error('Erreur lors de la mise à jour du statut');
  }
}; 



  if (loading) return <SkeletonDetails />;
  if (!hospitalisation) return <div className="space-y-6 text-center">Hospitalisation non trouvée</div>;

  // Un médecin ne peut modifier que les hospitalisations dont il est responsable.
  const editable = peutModifier(user?.role, user?.medecinId, hospitalisation.idMedecinResponsable);

  // Nombre de jours de séjour (même règle que la facturation : bornes incluses).
  const nbJours = (() => {
    const debut = new Date(hospitalisation.dateAdmission);
    const fin = hospitalisation.dateSortie ? new Date(hospitalisation.dateSortie) : new Date();
    const d0 = new Date(debut.getFullYear(), debut.getMonth(), debut.getDate()).getTime();
    const d1 = new Date(fin.getFullYear(), fin.getMonth(), fin.getDate()).getTime();
    return Math.max(1, Math.round((d1 - d0) / 86400000) + 1);
  })();

  return (
    <PageShell
      title="Détails de l'hospitalisation"
      onBack={() => router.push('/patients/hospitalisations')}
      actions={
        editable ? (
          <Button icon={<FaEdit />} onClick={() => router.push(`/patients/hospitalisations/${hospitalisation.idHospitalisation}/modifier`)}>
            Modifier
          </Button>
        ) : (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            Lecture seule
          </span>
        )
      }
      maxWidth="max-w-6xl"
    >
      <DetailBanner
        meta="Hospitalisation"
        title={`Hospitalisation du ${format(new Date(hospitalisation.dateAdmission), 'dd MMMM yyyy', { locale: fr })}`}
        subtitle={`N° admission : ${hospitalisation.numeroAdmission}`}
        badges={
          <>
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statutColors[hospitalisation.statut]}`}>
              {hospitalisation.statut}
            </span>
            {editable && (
              <IconButton color="blue" title="Changer le statut" onClick={() => setShowStatutModal(true)}>
                <FaExchangeAlt size={14} />
              </IconButton>
            )}
          </>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaUserInjured} label="Patient" value={`${hospitalisation.patientNom} ${hospitalisation.patientPrenom}`} />
          <InfoCard icon={FaUserMd} label="Médecin responsable" value={`Dr. ${hospitalisation.medecinNom} ${hospitalisation.medecinPrenom}`} />
          <InfoCard icon={FaBed} label="Chambre" value={hospitalisation.chambreNumero || 'Non attribuée'} />
          <InfoCard
            icon={FaCalendarAlt}
            label="Date d'admission"
            value={format(new Date(hospitalisation.dateAdmission), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
          />
          {hospitalisation.dateSortie && (
            <InfoCard
              icon={FaCalendarAlt}
              label="Date de sortie"
              value={format(new Date(hospitalisation.dateSortie), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
            />
          )}
          <InfoCard
            icon={FaCalendarAlt}
            label="Durée du séjour"
            value={`${nbJours} jour${nbJours > 1 ? 's' : ''}${!hospitalisation.dateSortie ? ' (en cours)' : ''}`}
          />
          <InfoCard icon={FaClipboardList} label="Mode d'entrée" value={hospitalisation.modeEntree} />
          <InfoCard icon={FaClipboardList} label="Provenance" value={hospitalisation.provenance || '—'} />
        </InfoGrid>
      </DetailBanner>

      {/* Détails médicaux */}
      <FormSection title="Informations médicales" icon={<FaHeartbeat />}>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <p className="text-sm text-gray-500">Motif d&apos;admission</p>
            <p className="font-medium">{hospitalisation.motifAdmission}</p>
          </div>
          {hospitalisation.diagnosticPrincipal && (
            <div>
              <p className="text-sm text-gray-500">Diagnostic principal</p>
              <p className="font-medium">{hospitalisation.diagnosticPrincipal}</p>
            </div>
          )}
          {hospitalisation.traitementsEnCours && (
            <div>
              <p className="text-sm text-gray-500">Traitements en cours</p>
              <p>{hospitalisation.traitementsEnCours}</p>
            </div>
          )}
          {hospitalisation.examensRealises && (
            <div>
              <p className="text-sm text-gray-500">Examens réalisés</p>
              <p>{hospitalisation.examensRealises}</p>
            </div>
          )}
          {hospitalisation.regimeAlimentaire && (
            <div>
              <p className="text-sm text-gray-500">Régime alimentaire</p>
              <p>{hospitalisation.regimeAlimentaire}</p>
            </div>
          )}
          {hospitalisation.consignesParticulieres && (
            <div>
              <p className="text-sm text-gray-500">Consignes particulières</p>
              <p>{hospitalisation.consignesParticulieres}</p>
            </div>
          )}
        </div>
      </FormSection>

      {/* Statut et sortie */}
      {(hospitalisation.modeSortie || hospitalisation.notesSortie) && (
        <FormSection title="Statut et sortie" icon={<FaExchangeAlt />}>
          <div className="flex flex-wrap gap-6 items-start">
            {hospitalisation.modeSortie && (
              <div>
                <p className="text-sm text-gray-500">Mode de sortie</p>
                <p className="font-semibold">{hospitalisation.modeSortie}</p>
                {hospitalisation.destinationSortie && (
                  <p className="text-xs text-gray-500">Destination : {hospitalisation.destinationSortie}</p>
                )}
              </div>
            )}
            {hospitalisation.notesSortie && (
              <div className="flex-1">
                <p className="text-sm text-gray-500">Notes de sortie</p>
                <p className="text-sm bg-slate-50 p-2 rounded">{hospitalisation.notesSortie}</p>
              </div>
            )}
          </div>
        </FormSection>
      )}

      {/* Modal de changement de statut */}
      {showStatutModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setShowStatutModal(false)}>
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold mb-4">Changer le statut</h3>
            <select
              value={selectedStatut || ''}
              onChange={(e) => setSelectedStatut(e.target.value as StatutHospitalisation)}
              className="w-full border rounded-lg p-2 mb-4"
            >
              <option value="">Sélectionner un statut</option>
              {allStatuts.map(statut => (
                <option key={statut} value={statut}>{statut}</option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowStatutModal(false)}
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                onClick={handleStatutChange}
                disabled={!selectedStatut}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
