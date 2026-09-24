'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaPills, FaPlus, FaTrash, FaEye, FaEdit, FaChartBar, FaFilter, FaSearch } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterInput } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { delivranceService } from '@/app/services/delivranceService';
import type { DelivranceResponse } from '@/app/types/delivrance';
import type { PagedResult } from '@/app/types/pagination';

type DelivranceListItem = DelivranceResponse & { niveauPriorite?: string };

const prioriteStyles: Record<string, string> = {
  URGENTE: 'bg-rose-50 text-rose-700 border-rose-200',
  NORMALE: 'bg-sky-50 text-sky-700 border-sky-200',
  FAIBLE: 'bg-slate-50 text-gray-600 border-slate-200',
};

export default function DelivranceList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [data, setData] = useState<PagedResult<DelivranceResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const pageSize = 10;

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = searchTerm
        ? await delivranceService.search(searchTerm, pageIndex, pageSize)
        : await delivranceService.getAll(pageIndex, pageSize);
      setData(res);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, pageIndex, pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setPageIndex(1);
  };

  const handleDelete = async (id: number) => {
    if (await confirm({ title: 'Supprimer', message: 'Supprimer cette délivrance ?' })) {
      await delivranceService.delete(id);
      toast.success('Délivrance supprimée');
      fetchData();
    }
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Délivrances"
        subtitle="Suivi des ordonnances et médicaments délivrés"
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaChartBar />} onClick={() => router.push('/pharmacie/delivrances/statistiques')}>
              Statistiques
            </Button>
            <Button variant="secondary" icon={<FaChartBar />} onClick={() => router.push('/pharmacie/delivrances/marges')}>
              Marges
            </Button>
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/delivrances/nouveau')}>
              Nouvelle
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <form onSubmit={handleSearch} className="flex gap-2">
              <FilterInput
                type="text"
                placeholder="Rechercher par patient, ordonnance..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <Button type="submit" size="sm" icon={<FaSearch />}>Rechercher</Button>
            </form>
          </FilterPanel>
        </div>
      )}

      {!data || data.items.length === 0 ? (
        <EmptyState
          icon={<FaPills />}
          title="Aucune délivrance enregistrée"
          description="Enregistrez une nouvelle délivrance pour démarrer."
          action={
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/delivrances/nouveau')}>
              Nouvelle
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>N° Ordonnance</Th>
                <Th>Patient</Th>
                <Th>Pharmacien</Th>
                <Th>Date</Th>
                <Th>Priorité</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {data.items.map((d: DelivranceListItem) => (
                <Tr key={d.idDelivrance}>
                  <Td className="font-mono font-medium">{d.numeroOrdonnance || '-'}</Td>
                  <Td>{d.patientNom}</Td>
                  <Td className="text-gray-600">{d.pharmacienNom}</Td>
                  <Td>{format(new Date(d.dateDelivrance), 'dd MMM yyyy')}</Td>
                  <Td>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${prioriteStyles[d.niveauPriorite ?? ''] || 'bg-slate-50'}`}>
                      {d.niveauPriorite || 'NORMALE'}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir" onClick={() => router.push(`/pharmacie/delivrances/${d.idDelivrance}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/pharmacie/delivrances/${d.idDelivrance}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(d.idDelivrance)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {data && data.totalPages > 1 && (
            <Pagination
              pageIndex={data.pageIndex}
              totalPages={data.totalPages}
              onPageChange={setPageIndex}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}
