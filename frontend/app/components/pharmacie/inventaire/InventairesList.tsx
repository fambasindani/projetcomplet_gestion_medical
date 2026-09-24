'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEye, FaCheckCircle, FaFilter, FaBoxOpen, FaClipboardCheck, FaPrint } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { inventaireService } from '@/app/services/inventaireService';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import type { PagedResult } from '@/app/types/pagination';
import type { Inventaire } from '@/app/types/inventaire';

const statutStyles: Record<string, string> = {
  En_cours: 'bg-amber-50 text-amber-700 border-amber-200',
  Validé: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Clôturé: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function InventairesList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<Inventaire>>({
    items: [], pageIndex: 1, pageSize: 10, totalCount: 0, totalPages: 0,
    hasPreviousPage: false, hasNextPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ statut: '', type: '', start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await inventaireService.search({ ...pagination, ...filters });
      setPagedData(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [pagination, filters]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'Supprimer', message: 'Supprimer cet inventaire définitivement ?' });
    if (!ok) return;
    try {
      await inventaireService.delete(id);
      toast.success('Inventaire supprimé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleValider = async (id: number) => {
    const ok = await confirm({ title: 'Valider', message: 'Confirmer la validation de l\'inventaire ?' });
    if (!ok) return;
    try {
      await inventaireService.valider(id, 1);
      toast.success('Inventaire validé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la validation');
    }
  };

  const handleCloturer = async (id: number) => {
    const ok = await confirm({ title: 'Clôturer', message: 'Clôturer définitivement cet inventaire ?' });
    if (!ok) return;
    try {
      await inventaireService.cloturer(id);
      toast.success('Inventaire clôturé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la clôture');
    }
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Inventaires"
        subtitle="Suivi et pilotage des stocks de la pharmacie"
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/inventaire/nouveau')}>
              Nouvel Inventaire
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <FilterPanel>
            <FilterInput type="datetime-local" onChange={e => setFilters({ ...filters, start: e.target.value })} />
            <FilterInput type="datetime-local" onChange={e => setFilters({ ...filters, end: e.target.value })} />
            <FilterSelect onChange={e => setFilters({ ...filters, statut: e.target.value })}>
              <option value="">Tous les statuts</option>
              <option value="En_cours">En cours</option>
              <option value="Validé">Validé</option>
              <option value="Clôturé">Clôturé</option>
            </FilterSelect>
            <button type="button" onClick={() => setFilters({ statut: '', type: '', start: '', end: '' })} className="self-start text-sm text-gray-400 hover:text-red-500">
              Réinitialiser
            </button>
          </FilterPanel>
        </div>
      )}

      {pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaBoxOpen />}
          title="Aucun inventaire trouvé"
          description="Créez un nouvel inventaire pour commencer le suivi des stocks."
          action={
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/inventaire/nouveau')}>
              Nouvel Inventaire
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>ID</Th>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Réalisateur</Th>
                <Th>Statut</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((inv) => (
                <Tr key={inv.idInventaire}>
                  <Td className="font-semibold text-gray-900">#{inv.idInventaire}</Td>
                  <Td className="text-gray-600">{format(new Date(inv.dateInventaire), 'dd MMM yyyy, HH:mm')}</Td>
                  <Td>{inv.typeInventaire}</Td>
                  <Td>{inv.realisateurNom || '-'}</Td>
                  <Td>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${statutStyles[inv.statut]}`}>
                      {inv.statut.toUpperCase()}
                    </span>
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir" onClick={() => router.push(`/pharmacie/inventaire/${inv.idInventaire}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="indigo" title="Imprimer le PV" onClick={() => router.push(`/pharmacie/inventaire/${inv.idInventaire}/impression`)}>
                        <FaPrint size={14} />
                      </IconButton>
                      {inv.statut === 'En_cours' && (
                        <IconButton color="green" title="Valider" onClick={() => handleValider(inv.idInventaire)}>
                          <FaCheckCircle size={14} />
                        </IconButton>
                      )}
                      {inv.statut === 'Validé' && (
                        <IconButton color="blue" title="Clôturer" onClick={() => handleCloturer(inv.idInventaire)}>
                          <FaClipboardCheck size={14} />
                        </IconButton>
                      )}
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(inv.idInventaire)}>
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
              onPageChange={(p) => setPagination({ ...pagination, pageIndex: p })}
            />
          )}
        </TableContainer>
      )}
    </div>
  );
}
