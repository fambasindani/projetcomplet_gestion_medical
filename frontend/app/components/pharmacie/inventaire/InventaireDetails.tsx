'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaUser, FaCheckCircle, FaTable, FaBoxOpen, FaClipboardCheck, FaSyncAlt, FaPrint } from 'react-icons/fa';
import { inventaireService } from '@/app/services/inventaireService';
import type { Inventaire, LigneInventaire } from '@/app/types/inventaire';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';
import SkeletonDetails from '@/app/ui/SkeletonDetails';
import EmptyState from '@/app/ui/EmptyState';
import PageShell from '@/app/ui/PageShell';
import Button from '@/app/ui/Button';
import DetailBanner from '@/app/ui/DetailBanner';
import { InfoCard, InfoGrid } from '@/app/ui/InfoCard';
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

  const reload = async () => {
    const fresh = await inventaireService.getById(Number(id));
    setInventaire(fresh);
  };

  const handleValider = async () => {
    const ok = await confirm({ title: 'Valider', message: 'Confirmer la validation de cet inventaire ?' });
    if (!ok) return;
    try {
      await inventaireService.valider(Number(id), 1);
      toast.success('Inventaire validé');
      await reload();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleAjuster = async () => {
    const ok = await confirm({
      title: 'Ajuster le stock',
      message: 'Appliquer les quantités réelles comptées au stock des lots ?',
    });
    if (!ok) return;
    try {
      await inventaireService.ajuster(Number(id));
      toast.success('Stock ajusté');
      await reload();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleCloturer = async () => {
    const ok = await confirm({
      title: 'Clôturer',
      message: 'Clôturer définitivement cet inventaire ? Aucune modification ne sera plus possible.',
    });
    if (!ok) return;
    try {
      await inventaireService.cloturer(Number(id));
      toast.success('Inventaire clôturé');
      await reload();
    } catch (error) {
      toast.error(extractErrorMessage(error));
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
    <PageShell
      title={`Inventaire #${inventaire.idInventaire}`}
      onBack={() => router.back()}
      actions={
        <Button icon={<FaPrint />} onClick={() => router.push(`/pharmacie/inventaire/${id}/impression`)}>
          Imprimer le PV
        </Button>
      }
    >
      <DetailBanner
        meta="Inventaire"
        title={`Inventaire #${inventaire.idInventaire}`}
        subtitle={`Réalisé le ${format(new Date(inventaire.dateInventaire), 'dd/MM/yyyy')} à ${format(new Date(inventaire.dateInventaire), 'HH:mm')}`}
        badges={
          <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
            inventaire.statut === 'Clôturé'
              ? 'bg-blue-500/20 text-white'
              : inventaire.statut === 'Validé'
                ? 'bg-green-500/20 text-white'
                : 'bg-yellow-500/20 text-white'
          }`}>
            {inventaire.statut}
          </span>
        }
      >
        <InfoGrid>
          <InfoCard icon={FaTable} label="Type" value={inventaire.typeInventaire} />
          <InfoCard icon={FaUser} label="Réalisateur" value={inventaire.realisateurNom} />
          <InfoCard icon={FaBoxOpen} label="Lignes" value={inventaire.lignes?.length || 0} />
          <InfoCard icon={FaClipboardCheck} label="Statut" value={inventaire.statut} />
        </InfoGrid>

        <div className="px-6 pb-6">
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

        {inventaire.statut !== 'Clôturé' && (
          <div className="flex flex-wrap justify-end gap-4 border-t bg-slate-50 p-6">
            {(inventaire.statut === 'En_cours' || inventaire.statut === 'Validé') && (
              <Button variant="secondary" icon={<FaSyncAlt />} onClick={handleAjuster}>
                Ajuster le stock
              </Button>
            )}
            {inventaire.statut === 'En_cours' && (
              <Button icon={<FaCheckCircle />} onClick={handleValider}>
                Valider l&apos;inventaire
              </Button>
            )}
            {inventaire.statut === 'Validé' && (
              <Button icon={<FaClipboardCheck />} onClick={handleCloturer}>
                Clôturer l&apos;inventaire
              </Button>
            )}
          </div>
        )}
      </DetailBanner>
    </PageShell>
  );
}
