'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaPills, FaFlask, FaClipboardList, FaDollarSign,
  FaBoxes, FaInfoCircle, FaThermometerHalf, FaEdit
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';
import PageHeader from '@/app/ui/PageHeader';
import { medicamentService } from '@/app/services/medicamentService';
import { Medicament } from '@/app/types/medicament';

export default function MedicamentDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [medicament, setMedicament] = useState<Medicament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      medicamentService.getById(Number(id))
        .then(setMedicament)
        .catch(() => toast.error('Erreur de chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer "${medicament?.nomCommercial}" ?` });
    if (!ok) return;
    try {
      await medicamentService.delete(Number(id));
      toast.success('Médicament supprimé');
      router.push('/pharmacie/medicaments');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <SkeletonDetails />;
  if (!medicament) return (
    <EmptyState
      icon={<FaInfoCircle />}
      title="Médicament introuvable"
      description="Le médicament demandé n'existe pas ou a été supprimé."
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={medicament.nomCommercial}
        subtitle={`CIP: ${medicament.codeCip}${medicament.codeCis ? ` | CIS: ${medicament.codeCis}` : ''}`}
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/medicaments')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/pharmacie/medicaments/${id}/modifier`)}>
              Modifier
            </Button>
            <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{medicament.nomCommercial}</h1>
              <p className="flex items-center gap-2 opacity-90 font-mono">
                <FaPills /> CIP: {medicament.codeCip} {medicament.codeCis && `| CIS: ${medicament.codeCis}`}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${medicament.actif ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
              {medicament.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Grille d'infos principales */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoGroup title="Informations Pharmaceutiques" icon={FaInfoCircle}>
              <DetailRow label="Dénomination" value={medicament.denominationCommune} />
              <DetailRow label="Forme" value={medicament.formePharmaceutique} />
              <DetailRow label="Dosage" value={medicament.dosage} />
              <DetailRow label="Voie" value={medicament.voieAdministration} />
            </InfoGroup>

            <InfoGroup title="Composition" icon={FaFlask}>
              <p className="text-sm text-gray-600 leading-relaxed italic">{medicament.substanceActive || 'Composition non précisée'}</p>
            </InfoGroup>
          </section>

          {/* Section Médicale */}
          <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><FaClipboardList /> Données Médicales</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <p><strong>Indications:</strong><br/>{medicament.indications || 'N/A'}</p>
              <p><strong>Précautions:</strong><br/>{medicament.precautionsEmploi || 'N/A'}</p>
            </div>
          </section>

          {/* Stock et Prix */}
          <section className="grid md:grid-cols-3 gap-6">
            <StatCard title="Stock" value={medicament.stockMinimum} icon={FaBoxes} sub="Minimum requis" />
            <StatCard title="Prix Vente" value={`$${medicament.prixVente}`} icon={FaDollarSign} sub={`Taux: ${medicament.tauxRemboursement}%`} />
            <StatCard title="Conservation" value={medicament.temperatureConservation || 'Ambiante'} icon={FaThermometerHalf} sub={`${medicament.dureeConservationMois} mois`} />
          </section>
        </div>
      </div>
    </div>
  );
}

function InfoGroup({ title, icon: Icon, children }: { title: string; icon: IconType; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Icon className="text-indigo-500" /> {title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: ReactNode }) {
  return <p className="text-sm"><span className="text-gray-500">{label}:</span> <span className="font-medium text-gray-900 ml-2">{value || '-'}</span></p>;
}

function StatCard({ title, value, icon: Icon, sub }: { title: string; value: ReactNode; icon: IconType; sub?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold text-gray-400 uppercase">{title}</p>
        <Icon className="text-indigo-500" />
      </div>
      <p className="text-xl font-bold text-gray-800">{value}</p>
      <p className="text-[10px] text-gray-400 uppercase">{sub}</p>
    </div>
  );
}
