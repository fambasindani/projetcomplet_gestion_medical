// app/pharmacie/fournisseurs/page.tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { FaPlus, FaEdit, FaTrash, FaEye, FaFilter, FaBuilding, FaSearch } from 'react-icons/fa';
import { useConfirm } from 'react-use-confirming-dialog';
import Pagination from '@/app/ui/Pagination';
import SkeletonTable from '@/app/ui/SkeletonTable';
import PageHeader from '@/app/ui/PageHeader';
import EmptyState from '@/app/ui/EmptyState';
import Button, { IconButton } from '@/app/ui/Button';
import { FilterPanel, FilterInput, FilterSelect } from '@/app/ui/FilterControls';
import { TableContainer, Table, THead, TBody, Tr, Th, Td } from '@/app/ui/Table';
import { fournisseurService } from '@/app/services/fournisseurService';
import { Fournisseur } from '@/app/types/fournisseur';
import { extractErrorMessage } from '@/app/utils/extractErrorMessage';

export default function FournisseursList() {
  const router = useRouter();
  const confirm = useConfirm();
  const [pagedData, setPagedData] = useState<{ items: Fournisseur[]; totalCount: number; pageIndex: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchNom, setSearchNom] = useState('');
  const [searchNomInput, setSearchNomInput] = useState('');
  const [filterActif, setFilterActif] = useState<boolean | undefined>(undefined);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({ pageIndex: 1, pageSize: 10 });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fournisseurService.search({
        nom: searchNom || undefined,
        actif: filterActif,
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
      });
      setPagedData(data);
    } catch {
      toast.error('Erreur de chargement');
      setPagedData({ items: [], totalCount: 0, pageIndex: 1, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [searchNom, filterActif, pagination.pageIndex, pagination.pageSize]);

  useEffect(() => {
    void (async () => { await fetchData(); })();
  }, [fetchData]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchNom(searchNomInput);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const clearFilters = () => {
    setSearchNom('');
    setSearchNomInput('');
    setFilterActif(undefined);
    setPagination(prev => ({ ...prev, pageIndex: 1 }));
  };

  const handleDelete = async (f: Fournisseur) => {
    const ok = await confirm({ title: 'Supprimer', message: `Supprimer "${f.nomFournisseur}" ?` });
    if (!ok) return;
    try {
      await fournisseurService.delete(f.idFournisseur);
      toast.success('Fournisseur supprimé');
      fetchData();
    } catch (error) {
      toast.error(extractErrorMessage(error));
    }
  };

  const handleEdit = (f: Fournisseur) => {
    router.push(`/pharmacie/fournisseurs/${f.idFournisseur}/modifier`);
  };

  const handleAdd = () => {
    router.push('/pharmacie/fournisseurs/nouveau');
  };

  if (loading) return <SkeletonTable columns={7} rows={8} />;
  if (!pagedData) return <div className="p-6 text-center">Aucune donnée</div>;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fournisseurs pharmaceutiques"
        subtitle={`${pagedData.totalCount || 0} fournisseurs`}
        actions={
          <>
            <Button variant="secondary" icon={<FaFilter />} onClick={() => setShowFilters(!showFilters)}>
              Filtres
            </Button>
            <Button icon={<FaPlus />} onClick={handleAdd}>
              Nouveau fournisseur
            </Button>
          </>
        }
      />

      {showFilters && (
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <FilterPanel>
            <form onSubmit={handleSearch} className="flex gap-2">
              <FilterInput
                type="text"
                placeholder="Rechercher par nom..."
                value={searchNomInput}
                onChange={(e) => setSearchNomInput(e.target.value)}
              />
              <Button type="submit" size="sm" icon={<FaSearch />}>Rechercher</Button>
            </form>
            <FilterSelect
              value={filterActif === undefined ? '' : filterActif ? 'true' : 'false'}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') setFilterActif(undefined);
                else setFilterActif(val === 'true');
              }}
            >
              <option value="">Tous (actifs/inactifs)</option>
              <option value="true">Actifs</option>
              <option value="false">Inactifs</option>
            </FilterSelect>
          </FilterPanel>
          <div className="mt-4 text-right">
            <button onClick={clearFilters} className="text-sm text-red-600 hover:text-red-700">
              Effacer les filtres
            </button>
          </div>
        </div>
      )}

      {pagedData.items.length === 0 ? (
        <EmptyState
          icon={<FaBuilding />}
          title="Aucun fournisseur"
          description="Ajoutez un nouveau fournisseur pour démarrer."
          action={
            <Button icon={<FaPlus />} onClick={handleAdd}>
              Nouveau fournisseur
            </Button>
          }
        />
      ) : (
        <TableContainer>
          <Table>
            <THead>
              <tr>
                <Th>Nom</Th>
                <Th>Contact</Th>
                <Th>Téléphone</Th>
                <Th>Email</Th>
                <Th>Délai livr.</Th>
                <Th>Actif</Th>
                <Th align="center">Actions</Th>
              </tr>
            </THead>
            <TBody>
              {pagedData.items.map((f: Fournisseur) => (
                <Tr key={f.idFournisseur}>
                  <Td className="font-medium">{f.nomFournisseur}</Td>
                  <Td>{f.contactNom || '-'}</Td>
                  <Td>{f.telephone || '-'}</Td>
                  <Td>{f.email || '-'}</Td>
                  <Td>{f.delaiLivraison ? `${f.delaiLivraison} j` : '-'}</Td>
                  <Td>
                    {f.actif ? <span className="text-green-600">Oui</span> : <span className="text-red-600">Non</span>}
                  </Td>
                  <Td className="text-center">
                    <div className="flex justify-center gap-2">
                      <IconButton color="gray" title="Voir" onClick={() => router.push(`/pharmacie/fournisseurs/${f.idFournisseur}`)}>
                        <FaEye size={14} />
                      </IconButton>
                      <IconButton color="blue" title="Modifier" onClick={() => handleEdit(f)}>
                        <FaEdit size={14} />
                      </IconButton>
                      <IconButton color="red" title="Supprimer" onClick={() => handleDelete(f)}>
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
