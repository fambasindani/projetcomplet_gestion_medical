'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft,
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
import PageHeader from '@/app/ui/PageHeader';
import Button, { IconButton } from '@/app/ui/Button';
import { hospitalisationService } from '@/app/services/hospitalisationService';
import { Hospitalisation, StatutHospitalisation } from '@/app/types/hospitalisation';

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails de l'hospitalisation"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/patients/hospitalisations')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/patients/hospitalisations/${hospitalisation.idHospitalisation}/modifier`)}>
              Modifier
            </Button>
          </>
        }
      />

      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              Hospitalisation du {format(new Date(hospitalisation.dateAdmission), 'dd MMMM yyyy', { locale: fr })}
            </h1>
            <p className="text-indigo-100 text-sm">
              N° admission : {hospitalisation.numeroAdmission}
            </p>
          </div>

          {/* Corps */}
          <div className="p-6 space-y-6">
            {/* Informations générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaUserInjured className="text-blue-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Patient</p>
                    <p className="font-semibold">
                      {hospitalisation.patientNom} {hospitalisation.patientPrenom}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaUserMd className="text-green-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Médecin responsable</p>
                    <p className="font-semibold">
                      Dr. {hospitalisation.medecinNom} {hospitalisation.medecinPrenom}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaBed className="text-purple-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Chambre</p>
                    <p className="font-semibold">{hospitalisation.chambreNumero || 'Non attribuée'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaCalendarAlt className="text-indigo-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Date d&apos;admission</p>
                    <p className="font-semibold">
                      {format(new Date(hospitalisation.dateAdmission), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                    </p>
                  </div>
                </div>
                {hospitalisation.dateSortie && (
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-orange-500 text-xl" />
                    <div>
                      <p className="text-sm text-gray-500">Date de sortie</p>
                      <p className="font-semibold">
                        {format(new Date(hospitalisation.dateSortie), "EEEE d MMMM yyyy 'à' HH'h'mm", { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FaClipboardList className="text-gray-500 text-xl" />
                  <div>
                    <p className="text-sm text-gray-500">Mode {"d'entrée"}</p>
                    <p className="font-semibold">{hospitalisation.modeEntree}</p>
                    {hospitalisation.provenance && (
                      <p className="text-xs text-gray-500">Provenance : {hospitalisation.provenance}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Détails médicaux */}
            <div className="border-t pt-4 space-y-4">
              <h3 className="text-lg font-semibold text-indigo-700 flex items-center gap-2">
                <FaHeartbeat /> Informations médicales
              </h3>
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
            </div>

            {/* Statut et sortie */}
            <div className="border-t pt-4 space-y-4">
              <div className="flex flex-wrap gap-6 items-start">
                <div>
                  <p className="text-sm text-gray-500">Statut</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statutColors[hospitalisation.statut]}`}>
                      {hospitalisation.statut}
                    </span>
                    <IconButton color="blue" title="Changer le statut" onClick={() => setShowStatutModal(true)}>
                      <FaExchangeAlt size={14} />
                    </IconButton>
                  </div>
                </div>
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
                    <p className="text-sm bg-gray-50 p-2 rounded">{hospitalisation.notesSortie}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

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
                className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50"
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
    </div>
  );
}
