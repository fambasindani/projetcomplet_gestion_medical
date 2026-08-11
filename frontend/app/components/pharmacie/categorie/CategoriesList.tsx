'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaTag } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import RefreshButton from '@/app/ui/RefreshButton';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { categorieService } from '@/app/services/categorieService';
import { Categorie } from '@/app/types/categorie';
import type { PagedResult } from '@/app/types/pagination';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

export default function CategoriesList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<PagedResult<Categorie> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categorieService.getAll(pagination.pageIndex, pagination.pageSize);
      setPagedData(data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleDelete = async (cat: Categorie) => {
    const ok = await confirm({
      title: 'Supprimer',
      message: `Supprimer la catégorie "${cat.nomCategorie}" ?`
    });
    if (!ok) return;
    try {
      await categorieService.delete(cat.idCategorie);
      toast.success('Catégorie supprimée');
      fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  if (loading) return <SkeletonTable columns={5} rows={8} />;
  if (!pagedData) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Catégories de médicaments"
        subtitle={`${pagedData?.totalCount || 0} catégorie(s)`}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/categories/nouveau')}>
              Nouvelle catégorie
            </Button>
          </>
        }
      />

      {pagedData?.items?.length === 0 ? (
        <EmptyState
          icon={<FaTag />}
          title="Aucune catégorie"
          description="Ajoutez une nouvelle catégorie pour démarrer."
          action={
            <Button icon={<FaPlus />} onClick={() => router.push('/pharmacie/categories/nouveau')}>
              Nouvelle catégorie
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Nom</Th>
                <Th>Code</Th>
                <Th>Description</Th>
                <Th align="center">Nb médicaments</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((cat: Categorie) => (
                <Tr key={cat.idCategorie}>
                  <Td className="whitespace-nowrap font-medium">{cat.nomCategorie}</Td>
                  <Td className="whitespace-nowrap text-gray-600">{cat.codeCategorie || '-'}</Td>
                  <Td className="max-w-md truncate text-gray-600">{cat.description || '-'}</Td>
                  <Td className="whitespace-nowrap text-center">{cat.nombreMedicaments || 0}</Td>
                  <Td className="whitespace-nowrap text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="blue" title="Modifier" onClick={() => router.push(`/pharmacie/categories/${cat.idCategorie}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(cat)}>
                        <FaTrash size={14} />
                      </IconButton>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
          {pagedData?.totalPages > 1 && (
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
