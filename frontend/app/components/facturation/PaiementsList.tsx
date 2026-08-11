'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaReceipt, FaMoneyBillWave } from 'react-icons/fa';

import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { factureService } from '@/app/services/factureService';
import type { Paiement } from '@/app/types/facture';
import { ModePaiementLabels, StatutPaiementLabels } from '@/app/types/facture';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

interface PaiementAvecFacture extends Paiement {
  numeroFacture: string;
  patientNom: string;
  patientPrenom: string;
}

export default function PaiementsList() {
  const [paiements, setPaiements] = useState<PaiementAvecFacture[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const collected: PaiementAvecFacture[] = [];
      let pageIndex = 1;
      let hasNext = true;
      while (hasNext && pageIndex <= 20) {
        const result = await factureService.getAll({ pageIndex, pageSize: 100 });
        result.items.forEach((facture) => {
          facture.paiements.forEach((paiement) => {
            collected.push({
              ...paiement,
              numeroFacture: facture.numeroFacture,
              patientNom: facture.patientNom,
              patientPrenom: facture.patientPrenom,
            });
          });
        });
        hasNext = result.hasNextPage;
        pageIndex += 1;
      }
      collected.sort(
        (a, b) => new Date(b.datePaiement).getTime() - new Date(a.datePaiement).getTime()
      );
      setPaiements(collected);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  if (loading) return <SkeletonTable columns={8} rows={8} />;

  const totalEncaissé = paiements.reduce((sum, paiement) => sum + paiement.montant, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        subtitle={`${paiements.length} paiements enregistrés`}
        actions={
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-lg">
            <FaMoneyBillWave /> Total encaissé : <strong>{totalEncaissé.toFixed(2)} $</strong>
          </div>
        }
      />

      {paiements.length === 0 ? (
        <EmptyState
          icon={<FaReceipt />}
          title="Aucun paiement enregistré"
          description="Les paiements effectués sur les factures apparaîtront ici"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Date</Th>
                <Th>Facture</Th>
                <Th>Patient</Th>
                <Th align="right">Montant</Th>
                <Th>Mode</Th>
                <Th>Référence</Th>
                <Th>Encaissé par</Th>
                <Th>Statut</Th>
              </tr>
            </THead>
            <TBody>
              {paiements.map((paiement) => (
                <Tr key={paiement.idPaiement}>
                  <Td className="whitespace-nowrap">
                    {format(new Date(paiement.datePaiement), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </Td>
                  <Td className="whitespace-nowrap font-medium text-indigo-600">
                    {paiement.numeroFacture}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {paiement.patientNom} {paiement.patientPrenom}
                  </Td>
                  <Td className="whitespace-nowrap text-right font-semibold text-green-600">
                    {paiement.montant.toFixed(2)} $
                  </Td>
                  <Td className="whitespace-nowrap">
                    {ModePaiementLabels[paiement.modePaiement]}
                  </Td>
                  <Td className="whitespace-nowrap">{paiement.referencePaiement || '-'}</Td>
                  <Td className="whitespace-nowrap">{paiement.encaisseurNom || '-'}</Td>
                  <Td className="whitespace-nowrap">
                    <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
                      {StatutPaiementLabels[paiement.statut]}
                    </span>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
}
