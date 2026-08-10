'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaArrowLeft, FaCheckCircle, FaTable, FaBoxOpen } from 'react-icons/fa';
import { inventaireService } from '@/app/services/inventaireService';
import type { Inventaire, LigneInventaire } from '@/app/types/inventaire';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import PageHeader from '@/app/ui/PageHeader';
import Button from '@/app/ui/Button';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { useConfirm } from 'react-use-confirming-dialog';

export default function InventaireDetails() {
  const { id } = useParams();
  const router = useRouter();
  const confirm = useConfirm();
  const [inventaire, setInventaire] = useState<Inventaire | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventaireService.getById(Number(id))
      .then(setInventaire)
      .catch(() => toast.error('Erreur de chargement'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleValider = async () => {
    const ok = await confirm({ title: 'Valider', message: 'Confirmer la validation définitive de cet inventaire ?' });
    if (!ok) return;
    try {
      await inventaireService.valider(Number(id), 1);
      toast.success('Inventaire validé avec succès');
      router.push('/pharmacie/inventaire');
    } catch {
      toast.error('Erreur lors de la validation');
    }
  };

  if (loading) return <SkeletonDetails />;
  if (!inventaire) return (
    <EmptyState
      icon={<FaBoxOpen />}
      title="Inventaire introuvable"
      description="L'inventaire demandé n'existe pas ou a été supprimé."
    />
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Inventaire #${inventaire.idInventaire}`}
        actions={
          <Button variant="secondary" icon={<FaArrowLeft />} onClick={() => router.push('/pharmacie/inventaire')}>
            Retour
          </Button>
        }
      />

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Inventaire #{inventaire.idInventaire}</h1>
            <p className="text-blue-100">Réalisé le {format(new Date(inventaire.dateInventaire), 'dd/MM/yyyy')} à {format(new Date(inventaire.dateInventaire), 'HH:mm')}</p>
          </div>
          <div className={`px-4 py-1.5 rounded-full text-sm font-semibold ${inventaire.statut === 'Valide' ? 'bg-green-500/20 text-white' : 'bg-yellow-500/20 text-white'}`}>
            {inventaire.statut}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 border-b bg-white p-6 md:grid-cols-4">
          {[
            { label: 'Type', value: inventaire.typeInventaire },
            { label: 'Réalisateur', value: inventaire.realisateurNom },
            { label: 'Lignes', value: inventaire.lignes?.length || 0 },
            { label: 'Statut', value: inventaire.statut },
          ].map((stat, i) => (
            <div key={i} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold">{stat.label}</p>
              <p className="text-gray-900 font-semibold">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaTable className="text-indigo-600" /> Détail des articles
          </h3>
          <TableContainer>
            <Table>
              <THead>
                <tr>
                  <Th>Médicament</Th>
                  <Th>Lot</Th>
                  <Th align="center">Théorique</Th>
                  <Th align="center">Réel</Th>
                  <Th align="center">Écart</Th>
                  <Th align="right">Valeur</Th>
                </tr>
              </THead>
              <TBody>
                {inventaire.lignes.map((l: LigneInventaire) => (
                  <Tr key={l.idLigneInventaire}>
                    <Td className="font-medium">{l.medicamentNom}</Td>
                    <Td className="text-gray-600">{l.lotNumero}</Td>
                    <Td className="text-center">{l.quantiteTheorique}</Td>
                    <Td className="text-center">{l.quantiteReelle}</Td>
                    <Td className={`text-center font-bold ${l.ecart !== 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {l.ecart != null && l.ecart > 0 ? '+' : ''}{l.ecart ?? ''}
                    </Td>
                    <Td className="text-right font-mono">{l.valeurEcart ? `${l.valeurEcart.toFixed(2)} $` : '-'}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </TableContainer>
        </div>

        {inventaire.statut === 'En_cours' && (
          <div className="p-6 bg-gray-50 border-t flex justify-end gap-4">
            <Button icon={<FaCheckCircle />} onClick={handleValider}>
              Valider l&apos;inventaire
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
