'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaBuilding, FaDollarSign, FaClipboardList,
  FaCheckCircle, FaTimesCircle, FaTruck, FaEdit
} from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import PageShell from '@/app/ui/PageShell';
import Button from '@/app/ui/Button';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { commandeService } from '@/app/services/commandeService';
import { CommandeFournisseur, StatutCommandeFournisseur } from '@/app/types/commande';

const statutStyles: Record<StatutCommandeFournisseur, string> = {
  En_attente: 'bg-amber-50 text-amber-700 border-amber-200',
  Confirmee: 'bg-blue-50 text-blue-700 border-blue-200',
  Expediee: 'bg-purple-50 text-purple-700 border-purple-200',
  Recue_partiellement: 'bg-orange-50 text-orange-700 border-orange-200',
  Recue_completement: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Annulee: 'bg-red-50 text-red-700 border-red-200'
};

const statutLabels: Record<StatutCommandeFournisseur, string> = {
  En_attente: 'En attente',
  Confirmee: 'Confirmée',
  Expediee: 'Expédiée',
  Recue_partiellement: 'Reçue partiellement',
  Recue_completement: 'Reçue complètement',
  Annulee: 'Annulée'
};

export default function CommandeDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [commande, setCommande] = useState<CommandeFournisseur | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      commandeService.getById(Number(id))
        .then(setCommande)
        .catch(() => toast.error('Erreur de chargement'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    if (!commande) return;
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer la commande ${commande.numeroCommande} ?` });
    if (!ok) return;
    try {
      await commandeService.delete(commande.idCommande);
      toast.success('Commande supprimée');
      router.push('/pharmacie/commandes');
    } catch { toast.error('Erreur'); }
  };

  if (loading) return <SkeletonDetails />;
  if (!commande) return (
    <EmptyState
      icon={<FaClipboardList />}
      title="Commande introuvable"
      description="La commande demandée n'existe pas ou a été supprimée."
    />
  );

  return (
    <PageShell
      title="Détails de la commande"
      onBack={() => router.back()}
      actions={
        <>
          <Button icon={<FaEdit />} onClick={() => router.push(`/pharmacie/commandes/${id}/modifier`)}>
            Modifier
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </>
      }
    >
      <DetailBanner
        meta="Commande"
        title={`Commande #${commande.numeroCommande}`}
        subtitle={`Créée le ${format(new Date(commande.dateCommande), "d MMMM yyyy 'à' HH:mm", { locale: fr })}`}
        badges={
          <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statutStyles[commande.statut]}`}>
            {statutLabels[commande.statut]}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaBuilding} label="Fournisseur" value={commande.fournisseurNom} />
          <InfoCard icon={FaDollarSign} label="Montant Total" value={`$${commande.montantTotal?.toFixed(2)}`} />
          <InfoCard icon={commande.paiementEffectue ? FaCheckCircle : FaTimesCircle} label="Paiement" value={commande.paiementEffectue ? 'Réglé' : 'En attente'} />
          <InfoCard icon={FaTruck} label="Livraison Prévue" value={commande.dateLivraisonPrevue ? format(new Date(commande.dateLivraisonPrevue), 'dd/MM/yyyy') : '-'} />
          <InfoCard icon={FaTruck} label="Livraison Réelle" value={commande.dateLivraisonReelle ? format(new Date(commande.dateLivraisonReelle), 'dd/MM/yyyy') : '-'} />
        </InfoGrid>

        <div className="px-6 pb-6">
          <section>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <FaClipboardList /> Articles commandés
            </h3>
            <TableContainer>
              <Table>
                <THead>
                  <tr>
                    <Th>Médicament</Th>
                    <Th align="center">Qté</Th>
                    <Th align="center">Reçue</Th>
                    <Th align="right">Prix Unit.</Th>
                    <Th align="right">Total</Th>
                  </tr>
                </THead>
                <TBody>
                  {commande.details?.map((d, i) => (
                    <Tr key={i}>
                      <Td className="font-medium text-gray-900">{d.medicamentNom}</Td>
                      <Td className="text-center">{d.quantiteCommandee}</Td>
                      <Td className="text-center">{d.quantiteRecue ?? '-'}</Td>
                      <Td className="text-right">${d.prixUnitaire}</Td>
                      <Td className="text-right font-bold text-indigo-600">${d.totalLigne?.toFixed(2)}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableContainer>
          </section>
        </div>
      </DetailBanner>
    </PageShell>
  );
}
