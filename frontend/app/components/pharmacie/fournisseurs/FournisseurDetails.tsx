'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaBuilding, FaUser, FaPhone,
  FaEnvelope, FaMapMarkerAlt, FaGlobe, FaIdCard, FaClock, FaStar, FaEdit
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import type { ReactNode } from 'react';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';
import PageHeader from '@/app/ui/PageHeader';
import { fournisseurService } from '@/app/services/fournisseurService';
import { Fournisseur } from '@/app/types/fournisseur';

export default function FournisseurDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [fournisseur, setFournisseur] = useState<Fournisseur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fournisseurService.getById(Number(id))
        .then(setFournisseur)
        .catch(() => toast.error('Erreur de chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer "${fournisseur?.nomFournisseur}" ?` });
    if (!ok) return;
    try {
      await fournisseurService.delete(Number(id));
      toast.success('Fournisseur supprimé');
      router.push('/pharmacie/fournisseurs');
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
    <div className="space-y-6">
      <PageHeader
        title={fournisseur.nomFournisseur}
        subtitle="Fournisseur agréé"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/fournisseurs')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/pharmacie/fournisseurs/${id}/modifier`)}>
              Modifier
            </Button>
            <Button variant="danger" onClick={handleDelete}>Supprimer</Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Header Moderne */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{fournisseur.nomFournisseur}</h1>
              <p className="opacity-80 flex items-center gap-2"><FaBuilding /> Fournisseur agréé</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase ${fournisseur.actif ? 'bg-emerald-500/20 text-emerald-100' : 'bg-red-500/20 text-red-100'}`}>
              {fournisseur.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Section Contact & Identité */}
          <section className="grid md:grid-cols-2 gap-8">
            <InfoGroup title="Informations de Contact" icon={FaUser}>
              <DetailRow icon={FaUser} label="Contact" value={fournisseur.contactNom} sub={fournisseur.contactFonction} />
              <DetailRow icon={FaPhone} label="Téléphone" value={fournisseur.telephone} />
              <DetailRow icon={FaEnvelope} label="Email" value={fournisseur.email} />
              <DetailRow icon={FaGlobe} label="Site Web" value={fournisseur.siteWeb} />
            </InfoGroup>

            <InfoGroup title="Données Administratives" icon={FaIdCard}>
              <DetailRow icon={FaIdCard} label="SIRET" value={fournisseur.siret} />
              <DetailRow icon={FaIdCard} label="N° Agrément" value={fournisseur.numeroAgrement} />
              <DetailRow icon={FaClock} label="Délai livraison" value={fournisseur.delaiLivraison ? `${fournisseur.delaiLivraison} jours` : '-'} />
              <DetailRow icon={FaStar} label="Note" value={fournisseur.note ? `${fournisseur.note}/5` : '-'} />
            </InfoGroup>
          </section>

          {/* Adresse */}
          {fournisseur.adresse && (
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-500" /> Adresse</h3>
              <p className="text-gray-700">{fournisseur.adresse}</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoGroup({ title, icon: Icon, children }: { title: string; icon: IconType; children: ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><Icon className="text-indigo-500" /> {title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value, sub }: { icon: IconType; label: string; value: string | null | undefined; sub?: string | null }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5"><Icon size={14} /></div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="font-medium text-gray-900">{value || '-'}</p>
        {sub && <p className="text-xs text-gray-500">{sub}</p>}
      </div>
    </div>
  );
}
