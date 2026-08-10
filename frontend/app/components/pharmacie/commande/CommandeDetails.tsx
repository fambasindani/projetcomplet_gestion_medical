'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import {
  FaArrowLeft, FaBuilding, FaCalendarAlt, FaDollarSign, FaClipboardList,
  FaCheckCircle, FaTimesCircle, FaTruck, FaEdit
} from 'react-icons/fa';
import type { IconType } from 'react-icons';
import { useConfirm } from 'react-use-confirming-dialog';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
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
    <div className="space-y-6">
      <PageHeader
        title="Détails de la commande"
        actions={
          <>
            <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/commandes')}>
              Retour
            </Button>
            <Button icon={<FaEdit />} onClick={() => router.push(`/pharmacie/commandes/${id}/modifier`)}>
              Modifier
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Supprimer
            </Button>
          </>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        {/* Header Moderne */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 p-8 text-white">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-1">Commande #{commande.numeroCommande}</h1>
              <p className="opacity-80 text-sm flex items-center gap-2">
                <FaCalendarAlt /> Créée le {format(new Date(commande.dateCommande), "d MMMM yyyy 'à' HH:mm", { locale: fr })}
              </p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${statutStyles[commande.statut]}`}>
              {statutLabels[commande.statut]}
            </span>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Grille d'Infos */}
          <div className="grid md:grid-cols-3 gap-6">
            <StatCard title="Fournisseur" value={commande.fournisseurNom} icon={FaBuilding} />
            <StatCard title="Montant Total" value={`$${commande.montantTotal?.toFixed(2)}`} icon={FaDollarSign} />
            <StatCard title="Paiement" value={commande.paiementEffectue ? 'Réglé' : 'En attente'} icon={commande.paiementEffectue ? FaCheckCircle : FaTimesCircle} />
          </div>

          {/* Dates de livraison */}
          <div className="grid rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100 md:grid-cols-2 gap-6">
            <InfoItem label="Livraison Prévue" value={commande.dateLivraisonPrevue ? format(new Date(commande.dateLivraisonPrevue), 'dd/MM/yyyy') : '-'} icon={FaTruck} />
            <InfoItem label="Livraison Réelle" value={commande.dateLivraisonReelle ? format(new Date(commande.dateLivraisonReelle), 'dd/MM/yyyy') : '-'} icon={FaTruck} />
          </div>

          {/* Table Détails */}
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

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }: { title: string; value: string | undefined; icon: IconType }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
      <div className="bg-indigo-50 p-3 rounded-lg text-indigo-500"><Icon /></div>
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400">{title}</p>
        <p className="font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function InfoItem({ label, value, icon: Icon }: { label: string; value: string; icon: IconType }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="text-gray-400" />
      <div>
        <p className="text-[10px] uppercase font-bold text-gray-400">{label}</p>
        <p className="font-medium text-gray-700">{value}</p>
      </div>
    </div>
  );
}
