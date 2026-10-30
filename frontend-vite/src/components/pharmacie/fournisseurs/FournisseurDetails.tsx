import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import {
  FaBuilding, FaUser, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaGlobe, FaIdCard, FaClock, FaStar, FaEdit
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/ui/SkeletonDetails';
import EmptyState from '@/ui/EmptyState';
import Button from '@/ui/Button';
import PageShell from '@/ui/PageShell';
import DetailBanner from '@/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/ui/InfoCard';
import { fournisseurService } from '@/services/fournisseurService';
import { Fournisseur } from '@/types/fournisseur';

export default function FournisseurDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fournisseurService.getById(Number(id))
        .then(setFournisseur)
        .catch(() => console.error('Chargement echoue'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer "${fournisseur?.nomFournisseur}" ?` });
    if (!ok) return;
    try {
      await fournisseurService.delete(Number(id));
      toast.success('Fournisseur supprimé');
      navigate('/pharmacie/fournisseurs');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <SkeletonDetails />;
  if (!fournisseur) return (
    <EmptyState
      icon={<FaBuilding />}
      title="Fournisseur introuvable"
      description="Le fournisseur demandé n'existe pas ou a été supprimé."
    />
  );

  return (
    <PageShell
      title={fournisseur.nomFournisseur}
      subtitle="Fournisseur agréé"
      onBack={() => navigate(-1)}
      actions={
        <>
          <Button icon={<FaEdit />} onClick={() => navigate(`/pharmacie/fournisseurs/${id}/modifier`)}>
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
        </>
      }
    >
      <DetailBanner
        meta="Fournisseur"
        title={fournisseur.nomFournisseur}
        subtitle="Fournisseur agréé"
        badges={
          <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${fournisseur.actif ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
            {fournisseur.actif ? 'Actif' : 'Inactif'}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaUser} label="Contact" value={fournisseur.contactNom} />
          <InfoCard icon={FaUser} label="Fonction" value={fournisseur.contactFonction} />
          <InfoCard icon={FaPhone} label="Téléphone" value={fournisseur.telephone} />
          <InfoCard icon={FaEnvelope} label="Email" value={fournisseur.email} />
          <InfoCard icon={FaGlobe} label="Site Web" value={fournisseur.siteWeb} />
          <InfoCard icon={FaIdCard} label="SIRET" value={fournisseur.siret} />
          <InfoCard icon={FaIdCard} label="N° Agrément" value={fournisseur.numeroAgrement} />
          <InfoCard icon={FaClock} label="Délai livraison" value={fournisseur.delaiLivraison ? `${fournisseur.delaiLivraison} jours` : '-'} />
          <InfoCard icon={FaStar} label="Note" value={fournisseur.note ? `${fournisseur.note}/5` : '-'} />
        </InfoGrid>

        {fournisseur.adresse && (
          <div className="px-6 pb-6">
            <section className="rounded-2xl border border-slate-100 bg-slate-50/40 p-6">
              <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-500" /> Adresse</h3>
              <p className="text-gray-700">{fournisseur.adresse}</p>
            </section>
          </div>
        )}
      </DetailBanner>
    </PageShell>
  );
}
