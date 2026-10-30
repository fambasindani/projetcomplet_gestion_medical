import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/utils/toast';
import { FaPlus, FaEdit, FaTrash, FaTag } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/ui/Pagination';
import SkeletonTable from '@/ui/SkeletonTable';
import PageHeader from '@/ui/PageHeader';
import EmptyState from '@/ui/EmptyState';
import Button, { IconButton } from '@/ui/Button';
import RefreshButton from '@/ui/RefreshButton';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/ui/Table';
import { categorieService } from '@/services/categorieService';
import { Categorie } from '@/types/categorie';
import type { PagedResult } from '@/types/pagination';
import { extractErrorMessage } from '@/utils/extractErrorMessage';
import Can from '@/components/common/Can';
import RequirePermission from '@/components/common/RequirePermission';
import { usePermission } from '@/hooks/usePermission';

export default function CategoriesList() {
  const navigate = useNavigate();
  const confirm = useConfirm();
  const { allowed: peutVoir } = usePermission('PHARMACIE_VOIR');
  const [pagedData, setPagedData] = useState<PagedResult<Categorie> | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    if (!peutVoir) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await categorieService.getAll(pagination.pageIndex, pagination.pageSize);
      setPagedData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageIndex, pagination.pageSize, peutVoir]);

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
    <RequirePermission permission="PHARMACIE_VOIR">
    <div className="space-y-6">
      <PageHeader
        title="Catégories de médicaments"
        subtitle={`${pagedData?.totalCount || 0} catégorie(s)`}
        actions={
          <>
            <RefreshButton onRefresh={fetchData} loading={loading} />
            <Can permission="PHARMACIE_GERER">
            <Button icon={<FaPlus />} onClick={() => navigate('/pharmacie/categories/nouveau')}>
              Nouvelle catégorie
            </Button>
            </Can>
          </>
        }
      />

      {pagedData?.items?.length === 0 ? (
        <EmptyState
          icon={<FaTag />}
          title="Aucune catégorie"
          description="Ajoutez une nouvelle catégorie pour démarrer."
          action={
            <Can permission="PHARMACIE_GERER">
            <Button icon={<FaPlus />} onClick={() => navigate('/pharmacie/categories/nouveau')}>
              Nouvelle catégorie
            </Button>
            </Can>
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
                      <Can permission="PHARMACIE_GERER">
                      <IconButton color="blue" title="Modifier" onClick={() => navigate(`/pharmacie/categories/${cat.idCategorie}/modifier`)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(cat)}>
                        <FaTrash size={14} />
                      </IconButton>
                      </Can>
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
    </RequirePermission>
  );
}
