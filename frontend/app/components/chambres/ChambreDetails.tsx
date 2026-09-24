'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
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
import type { IconType } from 'react-icons';
import { toast } from 'react-hot-toast';
import { chambreService } from '@/app/services/chambreService';
import { Chambre, StatutChambre, TypeChambre } from '@/app/types/chambre';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import PageShell from '@/app/ui/PageShell';
import DetailBanner from '@/app/ui/DetailBanner';
import FormSection from '@/app/ui/FormSection';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
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

  const equipements: { label: string; value: boolean; icon: IconType }[] = [
    { label: 'Téléphone', value: chambre.telephone, icon: FaPhone },
    { label: 'Télévision', value: chambre.television, icon: FaTv },
    { label: 'WiFi', value: chambre.wifi, icon: FaWifi },
    { label: 'Salle de bain privée', value: chambre.salleBainPrivee, icon: FaBath },
    { label: 'Accessible handicapés', value: chambre.accessibiliteHandicape, icon: FaWheelchair },
  ];

  return (
    <PageShell
      title="Détails de la chambre"
      onBack={() => router.push('/hospitalisations/chambres')}
      actions={
        <Button icon={<FaEdit />} onClick={() => router.push(`/hospitalisations/chambres/${id}/modifier`)}>
          Modifier
        </Button>
      }
      maxWidth="max-w-6xl"
    >
      {/* Bandeau principal */}
      <DetailBanner
        meta="Chambre"
        title={`Chambre ${chambre.numeroChambre}`}
        subtitle={`Étage ${chambre.etage ?? '—'} · ${chambre.batiment ?? 'Bâtiment inconnu'}`}
        badges={
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-200">Statut :</label>
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
        }
      >
        <InfoGrid>
          <InfoCard icon={FaLayerGroup} label="Type" value={typeLabels[chambre.typeChambre]} />
          <InfoCard icon={FaBuilding} label="Localisation" value={`Étage ${chambre.etage ?? '—'} · ${chambre.batiment ?? '—'}`} />
          <InfoCard icon={FaDollarSign} label="Prix par jour" value={chambre.prixJour ? `$${chambre.prixJour}` : 'Non défini'} />
          <InfoCard icon={FaStethoscope} label="Spécialité" value={chambre.nomSpecialite || 'Non affectée'} />
          <InfoCard icon={FaHospital} label="Hospitalisations" value={chambre.nombreHospitalisations} />
        </InfoGrid>
      </DetailBanner>

      {/* Équipements */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <FormSection title="Équipements" icon={<FaCheck />}>
          <InfoGrid className="p-0!">
            {equipements.map((eq) => (
              <InfoCard
                key={eq.label}
                icon={eq.icon}
                label={eq.label}
                value={
                  eq.value ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-semibold text-green-800">
                      <FaCheck size={10} /> Oui
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
                      <FaTimes size={10} /> Non
                    </span>
                  )
                }
              />
            ))}
          </InfoGrid>

          {chambre.equipements && (
            <div className="mt-4 rounded-lg bg-slate-50 p-4">
              <p className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaLayerGroup className="text-gray-400" /> Autres équipements
              </p>
              <p className="mt-1 text-sm text-gray-600">{chambre.equipements}</p>
            </div>
          )}
        </FormSection>
      </div>

      {chambre.notes && (
        <FormSection title="Notes" icon={<FaStickyNote />}>
          <p className="text-sm text-gray-600">{chambre.notes}</p>
        </FormSection>
      )}
    </PageShell>
  );
}
