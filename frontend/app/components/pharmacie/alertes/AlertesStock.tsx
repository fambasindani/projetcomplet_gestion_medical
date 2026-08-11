'use client';

import { useCallback, useEffect, useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaFilter, FaCheckCircle, FaTrash, FaSync, FaExclamationTriangle } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { alerteStockService } from '@/app/services/alerteStockService';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import type { PagedResult } from '@/app/types/pagination';
import type { AlerteStock, TypeAlerteStock } from '@/app/types/alerte';

const typeLabels: Record<string, string> = {
  STOCK_FAIBLE: 'Stock faible',
  STOCK_CRITIQUE: 'Stock critique',
  PEREMPTION_PROCHAINE: 'Péremption proche',
  PEREMPTION_DEPASSEE: 'Péremption dépassée',
};

const statusStyles: Record<string, string> = {
  true: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  false: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function AlertesStock() {
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<AlerteStock>>({
    items: [], pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0,
    hasPreviousPage: false, hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', traitee: '', idMedicament: '', start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof alerteStockService.search>[0] = {
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        traitee: filters.traitee === '' ? undefined : filters.traitee === 'true',
        dateStart: filters.start || undefined,
        dateEnd: filters.end || undefined,
        idMedicament: filters.idMedicament ? Number(filters.idMedicament) : undefined,
      };
      if (filters.type) params.type = filters.type as TypeAlerteStock;
      const data = await alerteStockService.search(params);
      setPagedData(data);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [pagination, filters]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleMarquerTraitee = async (alerte: AlerteStock) => {
    if (!(await confirm({ title: 'Confirmer', message: `Marquer l'alerte pour ${alerte.medicamentNom} comme traitée ?` }))) return;
    try {
      await alerteStockService.traiter(alerte.idAlerte, { actionEntreprise: 'Traitée via interface', traiteePar: 1 });
      toast.success('Alerte mise à jour');
      fetchData();
    } catch { toast.error('Erreur lors du traitement'); }
  };

  const handleDelete = async (id: number) => {
    if (!(await confirm({ title: 'Supprimer', message: 'Supprimer cette alerte ?' }))) return;
    try {
      await alerteStockService.delete(id);
      toast.success('Alerte supprimée');
      fetchData();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertes de Stock"
        subtitle="Gestion des ruptures et péremptions"
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaSync />} onClick={() => alerteStockService.verifier().then(fetchData)}>
              Vérifier
            </Button>
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <FilterSelect onChange={e => setFilters({ ...filters, type: e.target.value })}>
              <option value="">Tous les types</option>
              {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </FilterSelect>
            <FilterSelect onChange={e => setFilters({ ...filters, traitee: e.target.value })}>
              <option value="">Tous les statuts</option>
              <option value="false">Non traitée</option>
              <option value="true">Traitée</option>
            </FilterSelect>
            <FilterInput type="datetime-local" onChange={e => setFilters({ ...filters, start: e.target.value })} />
            <button type="button" onClick={() => setFilters({ type: '', traitee: '', idMedicament: '', start: '', end: '' })} className="self-start text-sm text-gray-400 hover:text-red-500">
              Réinitialiser
            </button>
          </FilterPanel>
        </div>
      )}

      {pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaExclamationTriangle />}
          title="Aucune alerte en attente"
          description="Les alertes de stock faible, critique ou de péremption apparaîtront ici."
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Médicament</Th>
                <Th>Type</Th>
                <Th>Seuils</Th>
                <Th>Date</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((a) => (
                <Tr key={a.idAlerte}>
                  <Td className="font-semibold text-gray-900">{a.medicamentNom}</Td>
                  <Td className="text-gray-600">{typeLabels[a.typeAlerte]}</Td>
                  <Td>{a.seuilActuel ?? '-'} / {a.seuilMinimum}</Td>
                  <Td>{format(new Date(a.dateAlerte), 'dd MMM yyyy')}</Td>
                  <Td>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statusStyles[String(a.traitee)]}`}>
                      {a.traitee ? 'TRAITÉE' : 'NON TRAITÉE'}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      {!a.traitee && (
                        <IconButton color="green" title="Marquer comme traitée" onClick={() => handleMarquerTraitee(a)}>
                          <FaCheckCircle size={14} />
                        </IconButton>
                      )}
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(a.idAlerte)}>
                        <FaTrash size={14} />
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
              onPageChange={(p) => setPagination(prev => ({ ...prev, pageIndex: p }))}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}
