'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FaArrowLeft, FaEdit, FaBed, FaBuilding, FaStethoscope, FaCheck, FaTimes } from 'react-icons/fa';
import { chambreService } from '@/app/services/chambreService';
import { Chambre, StatutChambre, TypeChambre } from '@/app/types/chambre';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';

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

  useEffect(() => {
    if (id) {
      chambreService.getById(Number(id))
        .then(setChambre)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <SkeletonDetails />;
  if (!chambre) return <div className="space-y-6">Chambre non trouvée</div>;

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
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Chambre {chambre.numeroChambre}</h1>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Informations générales</h3>
            <div className="space-y-2">
              <p><FaBed className="inline mr-2 text-gray-500" /> <strong>Type :</strong> {typeLabels[chambre.typeChambre]}</p>
              <p><strong>Étage :</strong> {chambre.etage ?? '-'}</p>
              <p><FaBuilding className="inline mr-2 text-gray-500" /> <strong>Bâtiment :</strong> {chambre.batiment ?? '-'}</p>
              <p><strong>Statut :</strong> <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                chambre.statut === StatutChambre.Disponible ? 'bg-green-100 text-green-800' :
                chambre.statut === StatutChambre.Occupee ? 'bg-red-100 text-red-800' :
                chambre.statut === StatutChambre.En_nettoyage ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>{statutLabels[chambre.statut]}</span></p>
              <p><strong>Prix par jour :</strong> {chambre.prixJour ? `$${chambre.prixJour}` : 'Non défini'}</p>
              <p><FaStethoscope className="inline mr-2 text-gray-500" /> <strong>Spécialité :</strong> {chambre.nomSpecialite || 'Non affectée'}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-3">Équipements</h3>
            <div className="grid grid-cols-2 gap-2">
              <p>{chambre.telephone ? <FaCheck className="inline text-green-600 mr-1" /> : <FaTimes className="inline text-red-600 mr-1" />} Téléphone</p>
              <p>{chambre.television ? <FaCheck className="inline text-green-600 mr-1" /> : <FaTimes className="inline text-red-600 mr-1" />} Télévision</p>
              <p>{chambre.wifi ? <FaCheck className="inline text-green-600 mr-1" /> : <FaTimes className="inline text-red-600 mr-1" />} WiFi</p>
              <p>{chambre.salleBainPrivee ? <FaCheck className="inline text-green-600 mr-1" /> : <FaTimes className="inline text-red-600 mr-1" />} Salle de bain privée</p>
              <p>{chambre.accessibiliteHandicape ? <FaCheck className="inline text-green-600 mr-1" /> : <FaTimes className="inline text-red-600 mr-1" />} Accessible handicapés</p>
            </div>
            {chambre.equipements && (
              <div className="mt-4">
                <strong>Autres équipements :</strong>
                <p className="text-gray-600 mt-1">{chambre.equipements}</p>
              </div>
            )}
            {chambre.notes && (
              <div className="mt-4">
                <strong>Notes :</strong>
                <p className="text-gray-600 mt-1">{chambre.notes}</p>
              </div>
            )}
            <div className="mt-4">
              <strong>Nombre {"d'hospitalisations"} :</strong> {chambre.nombreHospitalisations}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
