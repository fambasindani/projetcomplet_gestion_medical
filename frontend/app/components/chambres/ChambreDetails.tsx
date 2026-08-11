'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaEdit,
  FaBed,
  FaBuilding,
  FaStethoscope,
  FaCheck,
  FaTimes,
  FaDollarSign,
  FaHospital,
  FaPhone,
  FaTv,
  FaWifi,
  FaBath,
  FaWheelchair,
  FaStickyNote,
  FaLayerGroup,
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { chambreService } from '@/app/services/chambreService';
import { Chambre, StatutChambre, TypeChambre } from '@/app/types/chambre';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

const statutColors: Record<StatutChambre, string> = {
  Disponible: 'bg-green-100 text-green-800',
  Occupee: 'bg-red-100 text-red-800',
  En_nettoyage: 'bg-yellow-100 text-yellow-800',
  Hors_service: 'bg-gray-100 text-gray-800',
  Reservee: 'bg-blue-100 text-blue-800',
};

const statutLabels: Record<StatutChambre, string> = {
  Disponible: 'Disponible',
  Occupee: 'Occupée',
  En_nettoyage: 'En nettoyage',
  Hors_service: 'Hors service',
  Reservee: 'Réservée',
};

const typeLabels: Record<TypeChambre, string> = {
  Individuelle: 'Individuelle',
  Double: 'Double',
  Triple: 'Triple',
  Suite: 'Suite',
  Soins_intensifs: 'Soins intensifs',
};

export default function ChambreDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [chambre, setChambre] = useState<Chambre | null>(null);
  const [loading, setLoading] = useState(true);

  const loadChambre = () => {
    if (!id) return;
    chambreService.getById(Number(id))
      .then(setChambre)
      .catch((error) => toast.error(extractErrorMessage(error)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadChambre();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChangerStatut = async (statut: StatutChambre) => {
    if (!chambre || statut === chambre.statut) return;
    try {
      await chambreService.changerStatut(chambre.idChambre, statut);
      toast.success(`Statut mis à jour : ${statutLabels[statut]}`);
      loadChambre();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!chambre) return <div className="space-y-6">Chambre non trouvée</div>;

  const equipements = [
    { label: 'Téléphone', value: chambre.telephone, icon: <FaPhone /> },
    { label: 'Télévision', value: chambre.television, icon: <FaTv /> },
    { label: 'WiFi', value: chambre.wifi, icon: <FaWifi /> },
    { label: 'Salle de bain privée', value: chambre.salleBainPrivee, icon: <FaBath /> },
    { label: 'Accessible handicapés', value: chambre.accessibiliteHandicape, icon: <FaWheelchair /> },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Détails de la chambre"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/hospitalisations/chambres')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/hospitalisations/chambres/${id}/modifier`)}>
              Modifier
            </Button>
          </>
        }
      />

      {/* Bandeau principal */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Chambre {chambre.numeroChambre}</h1>
            <p className="mt-1 text-sm text-indigo-100">
              <FaBuilding className="inline mr-1" /> Étage {chambre.etage ?? '—'} · {chambre.batiment ?? 'Bâtiment inconnu'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-indigo-100">Statut :</label>
            <select
              value={chambre.statut}
              onChange={(e) => void handleChangerStatut(e.target.value as StatutChambre)}
              className={`rounded-full border-0 px-3 py-1.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-white ${statutColors[chambre.statut]}`}
              title="Changer le statut"
            >
              {(Object.keys(statutLabels) as StatutChambre[]).map((s) => (
                <option key={s} value={s}>{statutLabels[s]}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Cartes info */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Informations générales */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaBed className="text-indigo-600" /> Informations générales
          </h3>
          <dl className="space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
              <dt className="flex items-center gap-2 text-sm text-gray-500">
                <FaLayerGroup className="text-gray-400" /> Type
              </dt>
              <dd className="text-sm font-medium text-gray-800">{typeLabels[chambre.typeChambre]}</dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
              <dt className="flex items-center gap-2 text-sm text-gray-500">
                <FaBuilding className="text-gray-400" /> Localisation
              </dt>
              <dd className="text-sm font-medium text-gray-800">
                Étage {chambre.etage ?? '—'} · {chambre.batiment ?? '—'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
              <dt className="flex items-center gap-2 text-sm text-gray-500">
                <FaDollarSign className="text-gray-400" /> Prix par jour
              </dt>
              <dd className="text-sm font-medium text-gray-800">
                {chambre.prixJour ? `$${chambre.prixJour}` : 'Non défini'}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3">
              <dt className="flex items-center gap-2 text-sm text-gray-500">
                <FaStethoscope className="text-gray-400" /> Spécialité
              </dt>
              <dd className="text-sm font-medium text-gray-800">{chambre.nomSpecialite || 'Non affectée'}</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="flex items-center gap-2 text-sm text-gray-500">
                <FaHospital className="text-gray-400" /> Hospitalisations
              </dt>
              <dd className="text-sm font-medium text-gray-800">{chambre.nombreHospitalisations}</dd>
            </div>
          </dl>
        </div>

        {/* Équipements */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaCheck className="text-green-600" /> Équipements
          </h3>
          <ul className="space-y-3">
            {equipements.map((eq) => (
              <li key={eq.label} className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="flex items-center gap-2 text-sm text-gray-600">
                  <span className="text-gray-400">{eq.icon}</span> {eq.label}
                </span>
                {eq.value ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                    <FaCheck size={10} /> Oui
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                    <FaTimes size={10} /> Non
                  </span>
                )}
              </li>
            ))}
          </ul>

          {chambre.equipements && (
            <div className="mt-4 rounded-lg bg-gray-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaLayerGroup className="text-gray-400" /> Autres équipements
              </p>
              <p className="mt-1 text-sm text-gray-600">{chambre.equipements}</p>
            </div>
          )}
        </div>
      </div>

      {chambre.notes && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h3 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-800">
            <FaStickyNote className="text-indigo-600" /> Notes
          </h3>
          <p className="text-sm text-gray-600">{chambre.notes}</p>
        </div>
      )}
    </div>
  );
}
