'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { FaPlus, FaTrash, FaEdit, FaEye, FaSearch, FaFilter, FaUserNurse } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import { soinInfirmierService } from '@/app/services/soinInfirmierService';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import { TableContainer, Table, THead, Th, TBody, Tr, Td } from '@/app/ui/Table';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import { FilterPanel, FilterInput } from '@/app/ui/FilterControls';
import type { SoinInfirmier } from '@/app/types/soin';

export default function SoinsInfirmiersList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [soins, setSoins] = useState<SoinInfirmier[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [typeInput, setTypeInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10, totalPages: 0, totalCount: 0 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page: pagination.pageIndex - 1,
        size: pagination.pageSize,
      };
      if (searchTerm) params.typeSoin = searchTerm;
      if (typeFilter) params.typeSoin = typeFilter;
      const res = await soinInfirmierService.search(params);
      setSoins(res.items);
      setPagination(prev => ({
        ...prev,
        totalPages: res.totalPages || 0,
        totalCount: res.totalCount || 0,
      }));
    } catch (error) {
      console.error('Erreur fetchData:', error);
      toast.error('Erreur de chargement');
      setSoins([]);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, searchTerm, typeFilter]);

  useEffect(() => {
    void (async () => {
      await fetchData();
    })();
  }, [fetchData]);

  const handleDelete = async (id: number) => {
    const ok = await confirm({ title: 'Supprimer', message: 'Supprimer ce soin ?' });
    if (!ok) return;
    try {
      await soinInfirmierService.delete(id);
      toast.success('Soin supprimé');
      fetchData();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (soin: SoinInfirmier) => {
    router.push(`/hospitalisations/soins/${soin.idSoin}/modifier`);
  };

  const handleAdd = () => {
    router.push('/hospitalisations/soins/nouveau');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(searchInput);
    setTypeFilter(typeInput);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
    fetchData();
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchInput('');
    setTypeFilter('');
    setTypeInput('');
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  if (loading) return <SkeletonTable columns={6} rows={8} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Soins infirmiers"
        subtitle={`${pagination.totalCount || 0} soin(s)`}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button variant="secondary" onClick={() => setShowFilters(!showFilters)} icon={<FaFilter />}>
              Filtres
            </Button>
            <Button onClick={handleAdd} icon={<FaPlus />}>
              Nouveau soin
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <form onSubmit={handleSearch} className="flex gap-2 col-span-2">
              <FilterInput
                type="text"
                placeholder="Rechercher par type, description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm" icon={<FaSearch />}>Rechercher</Button>
            </form>
            <FilterInput
              type="text"
              placeholder="Type de soin (ex: Pansement)"
              value={typeInput}
              onChange={(e) => setTypeInput(e.target.value)}
            />
          </FilterPanel>
          {(searchTerm || typeFilter) && (
            <div className="mt-4 text-right">
              <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">Effacer les filtres</button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      {soins.length === 0 ? (
        <EmptyState icon={<FaUserNurse />} title="Aucun soin infirmier" />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Type</Th>
                <Th>Date</Th>
                <Th>Patient</Th>
                <Th>Infirmier</Th>
                <Th>Hospitalisation</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {soins.map((s) => (
                <Tr key={s.idSoin}>
                  <Td>{s.typeSoin}</Td>
                  <Td>{format(new Date(s.dateSoin), 'dd/MM/yyyy HH:mm')}</Td>
                  <Td>{s.patientNom}</Td>
                  <Td>{s.infirmierNom}</Td>
                  <Td>#{s.idHospitalisation}</Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir détails" onClick={() => router.push(`/hospitalisations/soins/${s.idSoin}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => handleEdit(s)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(s.idSoin)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagination.totalPages > 1 && (
            <Pagination pageIndex={pagination.pageIndex} totalPages={pagination.totalPages} onPageChange={(p) => setPagination(prev => ({...prev, pageIndex: p}))} />
          )}
        </TableContainer>
      )}
    </div>
  );
}
