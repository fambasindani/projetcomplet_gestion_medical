'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEye, FaFilter, FaFileInvoice } from 'react-icons/fa';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { factureService } from '@/app/services/factureService';
import type { Facture, StatutFacture } from '@/app/types/facture';
import { StatutFactureLabels, StatutFactureValues } from '@/app/types/facture';
import type { PagedResult } from '@/app/types/pagination';
import { PatientSearchSelect } from '@/app/components/common/PatientSearchSelect';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const statutColors: Record<StatutFacture, string> = {
  En_attente: 'bg-yellow-100 text-yellow-800',
  Partiellement_payé: 'bg-blue-100 text-blue-800',
  Payé: 'bg-green-100 text-green-800',
  Annulé: 'bg-gray-100 text-gray-700',
  Impayé: 'bg-red-100 text-red-800',
};

export default function FacturesList() {
  const router = useRouter();
  const [pagedData, setPagedData] = useState<PagedResult<Facture> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filtreStatut, setFiltreStatut] = useState<StatutFacture | ''>('');
  const [patientId, setPatientId] = useState<number | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await factureService.getAll({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        statut: filtreStatut,
        idPatient: patientId,
      });
      setPagedData(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, filtreStatut, patientId]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  const handleStatutChange = (value: string) => {
    setFiltreStatut(value as StatutFacture | '');
    setPagination((prev) => ({ ...prev, pageIndex: 1 }));
  };

  const handlePatientChange = (id: number | null) => {
    setPatientId(id);
    setPagination((prev) => ({ ...prev, pageIndex: 1 }));
  };

  if (loading) return <SkeletonTable columns={8} rows={8} />;
  if (!pagedData) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factures"
        subtitle={`${pagedData.totalCount} factures`}
        actions={
          <>
            <RefreshButton onRefresh={loadData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={() => router.push('/factures/nouveau')}>
              Nouvelle facture
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterSelect value={filtreStatut} onChange={(e) => handleStatutChange(e.target.value)}>
              <option value="">Tous les statuts</option>
              {StatutFactureValues.map((statut) => (
                <option key={statut} value={statut}>
                  {StatutFactureLabels[statut]}
                </option>
              ))}
            </FilterSelect>
            <PatientSearchSelect
              value={patientId}
              onChange={handlePatientChange}
              label="Patient"
              placeholder="Tous les patients"
            />
          </FilterPanel>
        </div>
      )}

      {pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaFileInvoice />}
          title="Aucune facture trouvée"
          description="Créez une nouvelle facture pour démarrer"
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N° Facture</Th>
                <Th>Patient</Th>
                <Th>Date émission</Th>
                <Th align="right">Montant TTC</Th>
                <Th align="right">Payé</Th>
                <Th align="right">Restant</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((facture) => (
                <Tr key={facture.idFacture}>
                  <Td className="whitespace-nowrap font-medium text-indigo-600">
                    {facture.numeroFacture}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {facture.patientNom} {facture.patientPrenom}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {format(new Date(facture.dateEmission), 'dd/MM/yyyy', { locale: fr })}
                  </Td>
                  <Td className="whitespace-nowrap text-right font-semibold">
                    {facture.montantTtc.toFixed(2)} $
                  </Td>
                  <Td className="whitespace-nowrap text-right text-green-600">
                    {facture.montantPaye.toFixed(2)} $
                  </Td>
                  <Td className="whitespace-nowrap text-right text-red-600">
                    {facture.montantRestant.toFixed(2)} $
                  </Td>
                  <Td className="whitespace-nowrap">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${statutColors[facture.statut]}`}
                    >
                      {StatutFactureLabels[facture.statut]}
                    </span>
                  </Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton
                        color="gray"
                        title="Détails"
                        onClick={() => router.push(`/factures/${facture.idFacture}`)}
                      >
                        <FaEye size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedData.totalPages > 1 && (
            <Pagination
              pageIndex={pagedData.pageIndex}
              totalPages={pagedData.totalPages}
              totalCount={pagedData.totalCount}
              pageSize={pagedData.pageSize}
              onPageChange={(page) =>
                setPagination((prev) => ({ ...prev, pageIndex: page }))
              }
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}
