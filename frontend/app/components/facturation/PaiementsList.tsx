'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from '@/app/utils/toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FaReceipt, FaMoneyBillWave, FaFilter, FaSearch } from 'react-icons/fa';

import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button from '@/app/ui/Button';
import { FilterPanel, FilterSelect, FilterInput } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { factureService } from '@/app/services/factureService';
import type { Paiement } from '@/app/types/facture';
import { ModePaiementLabels, StatutPaiementLabels, ModePaiementValues, type ModePaiement } from '@/app/types/facture';
import type { PagedResult } from '@/app/types/pagination';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

const statutPaiementOptions = [
  { value: '', label: 'Tous les statuts' },
  { value: 'Effectue', label: 'Effectué' },
  { value: 'En_attente', label: 'En attente' },
  { value: 'Refuse', label: 'Refusé' },
  { value: 'Rembourse', label: 'Remboursé' },
];

export default function PaiementsList() {
  const [pagedData, setPagedData] = useState<PagedResult<Paiement> | null>(null);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filterMode, setFilterMode] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [paginationParams, setPaginationParams] = useState({ pageIndex: 1, pageSize: 10 });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await factureService.getPaiements({
        pageIndex: paginationParams.pageIndex,
        pageSize: paginationParams.pageSize,
        modePaiement: filterMode || undefined,
        statut: filterStatut || undefined,
        term: searchTerm || undefined,
      });
      setPagedData(data);
    } catch (error) {
      toast.error(extractErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [paginationParams.pageIndex, paginationParams.pageSize, filterMode, filterStatut, searchTerm]);

  useEffect(() => {
    void (async () => { await loadData(); })();
  }, [loadData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPaginationParams(prev => ({ ...prev, pageIndex: 1 }));
  };

  const hasFilters = filterMode || filterStatut || searchTerm;

  if (loading && !pagedData) return <SkeletonTable columns={8} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Paiements"
        subtitle={`${pagedData?.totalCount ?? 0} paiement(s) enregistré(s)`}
        actions={
          <>
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <form onSubmit={handleSearch} className="flex gap-2 md:col-span-2">
              <FilterInput
                type="text"
                placeholder="Rechercher par référence..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <button type="submit" className="rounded-md bg-indigo-600 px-3 py-2 text-white hover:bg-indigo-500">
                <FaSearch />
              </button>
            </form>
            <FilterSelect value={filterMode} onChange={(e) => { setFilterMode(e.target.value); setPaginationParams(prev => ({ ...prev, pageIndex: 1 })); }}>
              <option value="">Tous les modes</option>
              {ModePaiementValues.map((m) => (
                <option key={m} value={m}>{ModePaiementLabels[m as ModePaiement]}</option>
              ))}
            </FilterSelect>
            <FilterSelect value={filterStatut} onChange={(e) => { setFilterStatut(e.target.value); setPaginationParams(prev => ({ ...prev, pageIndex: 1 })); }}>
              {statutPaiementOptions.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </FilterSelect>
          </FilterPanel>
          {hasFilters && (
            <div className="mt-4 text-right">
              <button
                onClick={() => { setFilterMode(''); setFilterStatut(''); setSearchTerm(''); setSearchInput(''); setPaginationParams(prev => ({ ...prev, pageIndex: 1 })); }}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Effacer les filtres
              </button>
            </div>
          )}
        </div>
      )}

      {!pagedData || pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaReceipt />}
          title="Aucun paiement enregistré"
          description={hasFilters ? 'Aucun résultat pour vos critères' : 'Les paiements effectués sur les factures apparaîtront ici'}
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
              {pagedData.items.map((paiement) => (
                <Tr key={paiement.idPaiement}>
                  <Td className="whitespace-nowrap">
                    {format(new Date(paiement.datePaiement), 'dd/MM/yyyy HH:mm', { locale: fr })}
                  </Td>
                  <Td className="whitespace-nowrap font-medium text-indigo-600">
                    {paiement.numeroFacture || `#${paiement.idFacture}`}
                  </Td>
                  <Td className="whitespace-nowrap">
                    {paiement.patientNom ? `${paiement.patientNom} ${paiement.patientPrenom ?? ''}` : '-'}
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
          {pagedData.totalPages > 1 && (
            <Pagination
              pageIndex={pagedData.pageIndex}
              totalPages={pagedData.totalPages}
              totalCount={pagedData.totalCount}
              pageSize={pagedData.pageSize}
              onPageChange={(page) => setPaginationParams(prev => ({ ...prev, pageIndex: page }))}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}