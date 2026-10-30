import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import {
  FaPills, FaFlask, FaClipboardList, FaDollarSign,
  FaBoxes, FaInfoCircle, FaThermometerHalf, FaEdit
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/ui/SkeletonDetails';
import EmptyState from '@/ui/EmptyState';
import Button from '@/ui/Button';
import PageShell from '@/ui/PageShell';
import DetailBanner from '@/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/ui/InfoCard';
import { medicamentService } from '@/services/medicamentService';
import { Medicament } from '@/types/medicament';

export default function MedicamentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [medicament, setMedicament] = useState<Medicament | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      medicamentService.getById(Number(id))
        .then(setMedicament)
        .catch(() => console.error('Chargement echoue'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer "${medicament?.nomCommercial}" ?` });
    if (!ok) return;
    try {
      await medicamentService.delete(Number(id));
      toast.success('Médicament supprimé');
      navigate('/pharmacie/medicaments');
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
    <PageShell
      title={medicament.nomCommercial}
      subtitle={`CIP: ${medicament.codeCip}${medicament.codeCis ? ` | CIS: ${medicament.codeCis}` : ''}`}
      onBack={() => navigate(-1)}
      actions={
        <>
          <Button icon={<FaEdit />} onClick={() => navigate(`/pharmacie/medicaments/${id}/modifier`)}>
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </>
      }
    >
      <DetailBanner
        meta="Médicament"
        title={medicament.nomCommercial}
        subtitle={`CIP: ${medicament.codeCip}${medicament.codeCis ? ` | CIS: ${medicament.codeCis}` : ''}`}
        badges={
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${medicament.actif ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
            {medicament.actif ? 'Actif' : 'Inactif'}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaInfoCircle} label="Dénomination" value={medicament.denominationCommune} />
          <InfoCard icon={FaPills} label="Forme" value={medicament.formePharmaceutique} />
          <InfoCard icon={FaFlask} label="Dosage" value={medicament.dosage} />
          <InfoCard icon={FaClipboardList} label="Voie" value={medicament.voieAdministration} />
          <InfoCard icon={FaBoxes} label="Stock minimum" value={medicament.stockMinimum} />
          <InfoCard icon={FaDollarSign} label="Prix de vente" value={medicament.prixVente != null ? `$${medicament.prixVente}` : '-'} />
          <InfoCard icon={FaClipboardList} label="Taux de remboursement" value={medicament.tauxRemboursement != null ? `${medicament.tauxRemboursement}%` : '-'} />
          <InfoCard icon={FaThermometerHalf} label="Conservation" value={`${medicament.temperatureConservation || 'Ambiante'} — ${medicament.dureeConservationMois} mois`} />
        </InfoGrid>

        <div className="space-y-6 px-6 pb-6">
          <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FaFlask className="text-indigo-500" /> Composition</h3>
            <p className="text-sm text-gray-600 leading-relaxed italic">{medicament.substanceActive || 'Composition non précisée'}</p>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FaClipboardList className="text-indigo-500" /> Données Médicales</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <p><strong>Indications:</strong><br/>{medicament.indications || 'N/A'}</p>
              <p><strong>Précautions:</strong><br/>{medicament.precautionsEmploi || 'N/A'}</p>
            </div>
          </section>
        </div>
      </DetailBanner>
    </PageShell>
  );
}
